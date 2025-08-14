"use client"

import type React from "react"
import { useMemo, useEffect, useState } from "react"
import { ChevronLeft } from "./ui/Icons"
import type { Country, Product } from "../lib/types"

interface ProductCardProps {
  product: Product
  onProductSelect: (product: Product) => void
  minPrice?: number
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect, minPrice }) => (
  <div
    onClick={() => onProductSelect(product)}
    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-custom-blue cursor-pointer transition-all"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-custom-blue font-semibold">{product.provider}</p>
        <h2 className="text-lg font-medium text-gray-800">{product.name}</h2>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="text-lg font-extrabold text-gray-900">{(minPrice ?? product.minPrice).toLocaleString()}원~</p>
        <p className="text-xs text-gray-500">1일 최저가</p>
      </div>
    </div>
  </div>
)

interface ProductListProps {
  selectedCountries: Country[]
  products: Product[]
  onProductSelect: (product: Product) => void
  onBack: () => void
}

const ProductList: React.FC<ProductListProps> = ({ selectedCountries, products, onProductSelect, onBack }) => {
  const [minPrices, setMinPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    const abort = new AbortController()

    const parseNumberMaybe = (value: any): number | null => {
      if (typeof value === "number") return value
      if (typeof value === "string") {
        const n = Number(value.replace(/[^0-9.-]/g, ""))
        return Number.isFinite(n) ? n : null
      }
      return null
    }

    const extractMinPrice = (detail: any): number | null => {
      try {
        const options = Array.isArray(detail?.options) ? detail.options : []
        let min: number | null = null
        for (const opt of options) {
          const channelLabels: any[] = Array.isArray(opt?.channel_labels) ? opt.channel_labels : []
          const plainLabels: any[] = Array.isArray(opt?.labels) ? opt.labels : []
          const flattened: any[] = []
          if (channelLabels.length > 0) {
            for (const ch of channelLabels) {
              if (Array.isArray(ch?.labels)) for (const lb of ch.labels) flattened.push(lb)
            }
          }
          if (flattened.length === 0 && plainLabels.length > 0) {
            for (const lb of plainLabels) flattened.push(lb)
          }
          for (const lb of flattened) {
            const priceRaw =
              lb?.repr_price_currency ??
              lb?.net_price_currency ??
              lb?.markup_amount_currency ??
              lb?.price ??
              lb?.salePrice ??
              lb?.amount ??
              lb?.fee ??
              lb?.sellingPrice
            const price = parseNumberMaybe(priceRaw)
            if (price != null && Number.isFinite(price)) {
              if (min == null || price < min) min = price
            }
          }
        }
        if (min != null) return min
      } catch {}

      // fallback: scan arrays in root
      try {
        const candidateArrays: any[] = []
        Object.values(detail || {}).forEach((v: any) => {
          if (Array.isArray(v)) candidateArrays.push(v)
        })
        let min: number | null = null
        for (const arr of candidateArrays) {
          for (const item of arr) {
            const priceRaw = item?.price ?? item?.salePrice ?? item?.amount ?? item?.fee ?? item?.sellingPrice
            const price = parseNumberMaybe(priceRaw)
            if (price != null && Number.isFinite(price)) {
              if (min == null || price < min) min = price
            }
          }
        }
        return min
      } catch {}
      return null
    }

    const load = async () => {
      const entries = await Promise.all(
        products.map(async (p) => {
          if (!p.apolloProductCode) return [p.id, undefined] as const
          try {
            const res = await fetch(`/api/product/${p.apolloProductCode}`, { cache: "no-store", signal: abort.signal })
            if (!res.ok) return [p.id, undefined] as const
            const detail = await res.json()
            const min = extractMinPrice(detail)
            return [p.id, min ?? undefined] as const
          } catch {
            return [p.id, undefined] as const
          }
        })
      )
      const map: Record<string, number> = {}
      for (const [id, min] of entries) {
        if (min != null) map[id] = min
      }
      setMinPrices(map)
    }

    if (products.length > 0) load()
    return () => abort.abort()
  }, [products])
  const { commonProducts, individualProductsByCountry } = useMemo(() => {
    const selectedCountryIds = selectedCountries.map((c) => c.id)

    const commonProducts = products.filter((p) => selectedCountryIds.every((id) => p.supportedCountries.includes(id)))
    const commonProductIds = new Set(commonProducts.map((p) => p.id))

    const individualProductsByCountry = selectedCountries
      .map((country) => {
        const countrySpecificProducts = products.filter(
          (p) => p.supportedCountries.includes(country.id) && !commonProductIds.has(p.id),
        )
        return {
          countryName: country.name,
          products: countrySpecificProducts,
        }
      })
      .filter((group) => group.products.length > 0)

    return { commonProducts, individualProductsByCountry }
  }, [selectedCountries, products])

  const hasProducts = commonProducts.length > 0 || individualProductsByCountry.length > 0

  return (
    <div className="w-full max-w-[750px] mx-auto px-4">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 truncate">{selectedCountries.map((c) => c.name).join(", ")}</h1>
      </div>

      {hasProducts ? (
        <div className="space-y-8">
          {commonProducts.length > 0 && (
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                ✅ {selectedCountries.map((c) => c.name).join(", ")} 함께 사용
              </h2>
              <div className="space-y-4">
                {commonProducts.map((product) => (
                  <ProductCard key={`common-${product.id}`} product={product} onProductSelect={onProductSelect} minPrice={minPrices[product.id]} />
                ))}
              </div>
            </section>
          )}

          {individualProductsByCountry.map((group) => (
            <section key={group.countryName}>
              <h2 className="text-xl font-bold mb-4 text-gray-800">✈️ {group.countryName} 추천 상품</h2>
              <div className="space-y-4">
                {group.products.map((product) => (
                  <ProductCard
                    key={`${group.countryName}-${product.id}`}
                    product={product}
                    onProductSelect={onProductSelect}
                    minPrice={minPrices[product.id]}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-gray-700">이런!</p>
          <p className="text-gray-500 mt-2">
            선택하신 국가 조합에 맞는 상품이 없어요.
            <br />
            국가를 다시 선택해주세요.
          </p>
          <button
            onClick={onBack}
            className="mt-6 bg-custom-blue text-white font-bold py-3 px-6 rounded-lg hover:brightness-95 transition"
          >
            국가 다시 선택하기
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductList
