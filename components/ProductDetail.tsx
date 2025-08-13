"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { ChevronLeft } from "./ui/Icons"
import type { Product, DataOption, Plan } from "../lib/types"

// 외부 링크 아이콘 컴포넌트
const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
)

interface ProductDetailProps {
  product: Product
  onBack: () => void
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }: ProductDetailProps) => {
  const [selectedDataOption, setSelectedDataOption] = useState<DataOption>(product.options[0])
  const [selectedPlan, setSelectedPlan] = useState<Plan>(product.options[0].plans[0])
  const [apolloDetail, setApolloDetail] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [optionsFromApi, setOptionsFromApi] = useState<DataOption[] | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const optionsToRender: DataOption[] = optionsFromApi ?? product.options

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollButtons)
      window.addEventListener("resize", checkScrollButtons)
      return () => {
        container.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
      }
    }
  }, [optionsToRender])

  useEffect(() => {
    const load = async () => {
      if (!product.apolloProductCode) return
      try {
        setLoading(true)
        setError(null)

        // Try the API route first
        const res = await fetch(`/api/product/${product.apolloProductCode}`, {
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          setApolloDetail(data)
        } else {
          throw new Error(`API 호출 실패: ${res.status} ${res.statusText}`)
        }
      } catch (e: any) {
        setError(e?.message ?? "상품 상세 조회 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [product.apolloProductCode])

  // Apollo 상세 응답을 UI 옵션/가격으로 매핑
  useEffect(() => {
    if (!apolloDetail) return

    function parseNumberMaybe(value: any): number | null {
      if (typeof value === "number") return value
      if (typeof value === "string") {
        const n = Number(value.replace(/[^0-9.-]/g, ""))
        return Number.isFinite(n) ? n : null
      }
      return null
    }

    function mapApolloDetailToOptions(detail: any): DataOption[] {
      // 1) Apollo 응답의 대표 구조 처리: options -> (channel_labels|labels) -> labels
      try {
        const options = Array.isArray(detail?.options) ? detail.options : null
        if (options && options.length > 0) {
          const resultsFromOptions: DataOption[] = []

          const extractDaysFromText = (text: any): number | null => {
            if (typeof text !== "string") return null
            const mKo = text.match(/(\d+)\s*일/) // 예: "5일"
            if (mKo) return Number.parseInt(mKo[1], 10)
            const mEn = text.match(/(\d+)\s*(?:day|days|D)\b/i) // 예: "7days", "10 day"
            if (mEn) return Number.parseInt(mEn[1], 10)
            return null
          }

          const extractPriceFromLabel = (label: any): number | null => {
            const priceRaw =
              label?.repr_price_currency ??
              label?.net_price_currency ??
              label?.markup_amount_currency ??
              label?.price ??
              label?.salePrice ??
              label?.amount ??
              label?.fee ??
              label?.sellingPrice
            return parseNumberMaybe(priceRaw)
          }

          for (const opt of options) {
            const dataLabel: string = (opt?.title ?? opt?.name ?? opt?.description ?? opt?.code ?? "옵션") as string

            // channel_labels 우선, 없으면 labels 사용
            const channelLabels: any[] = Array.isArray(opt?.channel_labels) ? opt.channel_labels : []
            const plainLabels: any[] = Array.isArray(opt?.labels) ? opt.labels : []

            const flattenedLabelItems: any[] = []
            if (channelLabels.length > 0) {
              for (const ch of channelLabels) {
                if (Array.isArray(ch?.labels)) {
                  for (const lb of ch.labels) flattenedLabelItems.push(lb)
                }
              }
            }
            if (flattenedLabelItems.length === 0 && plainLabels.length > 0) {
              for (const lb of plainLabels) flattenedLabelItems.push(lb)
            }

            const plans: Plan[] = []
            for (const lb of flattenedLabelItems) {
              const title: string = (lb?.title ?? lb?.code ?? "선택") as string
              const price = extractPriceFromLabel(lb)
              const days =
                extractDaysFromText(title) ??
                parseNumberMaybe(lb?.days) ??
                parseNumberMaybe(lb?.period) ??
                parseNumberMaybe(lb?.validDays) ??
                0
              if (price != null && Number.isFinite(price)) {
                plans.push({ days: Number.isFinite(days) ? (days as number) : 0, price })
              }
            }

            if (plans.length > 0) {
              // 기본은 기간(day) 오름차순, 모두 0이면 가격 오름차순
              const hasDays = plans.some((p) => p.days > 0)
              resultsFromOptions.push({
                data: dataLabel,
                plans: plans
                  .filter((p) => Number.isFinite(p.price))
                  .sort((a, b) => (hasDays ? a.days - b.days : a.price - b.price)),
              })
            }
          }

          if (resultsFromOptions.length > 0) {
            return resultsFromOptions
          }
        }
      } catch {}

      // 2) 포괄적 탐색(기존 로직): 다양한 키 후보를 통해 단일 배열 기반으로 매핑
      const candidateArrays: any[] = []
      const keys = [
        "plans",
        "planList",
        "items",
        "itemList",
        "options",
        "optionList",
        "productOptions",
        "productOptionList",
        "dataOptions",
        "dataOptionList",
        "priceList",
        "feeList",
      ]
      keys.forEach((k) => {
        const v = detail?.[k]
        if (Array.isArray(v)) candidateArrays.push(v)
      })
      if (candidateArrays.length === 0) {
        Object.values(detail || {}).forEach((v: any) => {
          if (Array.isArray(v)) candidateArrays.push(v)
        })
      }

      const flat: any[] = candidateArrays.flat().filter(Boolean)
      if (flat.length === 0) return []

      type GroupMap = Record<string, Plan[]>
      const groupedByDataLabel: GroupMap = {}

      for (const item of flat) {
        const dataLabel = (item?.data ||
          item?.dataLabel ||
          item?.dataOptionName ||
          item?.optionName ||
          item?.quotaTypeName ||
          "기본") as string
        const days = item?.days ?? item?.period ?? item?.periodDays ?? item?.useDays ?? item?.validDays
        const priceRaw = item?.price ?? item?.salePrice ?? item?.amount ?? item?.fee ?? item?.sellingPrice
        const price = parseNumberMaybe(priceRaw)
        const dayNumber = parseNumberMaybe(days)
        if (price == null || dayNumber == null) continue

        if (!groupedByDataLabel[dataLabel]) groupedByDataLabel[dataLabel] = []
        groupedByDataLabel[dataLabel].push({ days: dayNumber, price })
      }

      const result: DataOption[] = Object.entries(groupedByDataLabel).map(([label, plans]) => ({
        data: label,
        plans: plans.filter((p) => Number.isFinite(p.days) && Number.isFinite(p.price)).sort((a, b) => a.days - b.days),
      }))

      return result.filter((opt) => opt.plans.length > 0)
    }

    const derived = mapApolloDetailToOptions(apolloDetail)
    if (derived.length > 0) {
      setOptionsFromApi(derived)
      setSelectedDataOption(derived[0])
      setSelectedPlan(derived[0].plans[0])
    }
  }, [apolloDetail])

  const minPriceFromOptions = (() => {
    let min = Number.POSITIVE_INFINITY
    for (const opt of optionsToRender) {
      for (const p of opt.plans) {
        if (p.price < min) min = p.price
      }
    }
    return Number.isFinite(min) ? min : product.minPrice
  })()

  const handleDataOptionSelect = (option: DataOption) => {
    setSelectedDataOption(option)
    setSelectedPlan(option.plans[0])
  }

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    // 선택된 플랜을 콘솔에 출력 (디버깅용)
    console.log("선택된 플랜:", plan)
  }

  const handleBooking = () => {
    const bookingInfo = {
      productId: product.id,
      productName: product.name,
      dataOption: selectedDataOption.data,
      plan: selectedPlan,
      totalPrice: selectedPlan.price,
    }
    console.log("예약 정보:", bookingInfo)
    alert(
      `예약 페이지로 이동합니다.\n상품: ${bookingInfo.productName}\n옵션: ${bookingInfo.dataOption}, ${bookingInfo.plan.days}일\n가격: ${bookingInfo.totalPrice.toLocaleString()}원`,
    )
  }

  // 상품 상세 페이지로 이동하는 함수
  const handleGoToProductPage = () => {
    if (product.apolloProductCode) {
      const productUrl = `https://tourvis.com/activity/product/${product.apolloProductCode}`
      window.open(productUrl, "_blank", "noopener,noreferrer")
    }
  }

  // 스크롤바 숨기기를 위한 스타일
  const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyle }} />
      <div className="w-full max-w-[750px] mx-auto px-4 pb-40">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 truncate">{product.name}</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                {product.apolloProductCode && (
                  <button
                    onClick={handleGoToProductPage}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title="상품 상세 페이지로 이동"
                  >
                    <span>상세보기</span>
                    <ExternalLinkIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-base text-gray-500">{product.provider}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-2xl font-bold" style={{ color: "#0c0c0c" }}>
                {minPriceFromOptions.toLocaleString()}원
              </p>
              <p className="text-base text-gray-600">부터</p>
            </div>
          </div>

          {loading && <div className="mt-3 text-sm text-gray-500">상품 정보를 불러오는 중...</div>}

          {error && <div className="mt-3 text-sm text-red-600">상품 정보를 불러올 수 없습니다.</div>}

          <div className="mb-4">
            <p className="text-base text-gray-600 mb-2">지원 국가:</p>
            <div className="flex flex-wrap gap-2">
              {product.supportedCountries.map((country: string) => (
                <span key={country} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-base">
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 1. 데이터 옵션 선택 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">1. 데이터 옵션 선택</h3>
          <div className="relative">
            {/* 왼쪽 스크롤 버튼 */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="이전 옵션 보기"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* 오른쪽 스크롤 버튼 */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="다음 옵션 보기"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-10"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onScroll={checkScrollButtons}
            >
              {optionsToRender.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleDataOptionSelect(option)}
                  title={option.data} // 툴팁으로 전체 텍스트 표시
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-base font-medium transition-colors min-w-[120px] max-w-[200px] ${
                    selectedDataOption.data === option.data
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: selectedDataOption.data === option.data ? "#01c5fd" : undefined,
                  }}
                >
                  <span className="block truncate">{option.data}</span>
                </button>
              ))}
            </div>

            {/* 스크롤 인디케이터 (옵션이 많을 때만 표시) */}
            {optionsToRender.length > 3 && (
              <div className="flex justify-center mt-2">
                <div className="text-xs text-gray-400">← 좌우로 스와이프하거나 버튼을 클릭하세요 →</div>
              </div>
            )}
          </div>
        </div>

        {/* 2. 사용 기간 선택 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">2. 사용 기간 선택</h3>
          <div className="bg-gray-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-4">
              {selectedDataOption.plans.map((plan: Plan, index: number) => (
                <button
                  key={index}
                  onClick={() => handlePlanSelect(plan)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                    selectedPlan.days === plan.days
                      ? "text-gray-900 border scale-105"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:scale-105"
                  }`}
                  style={{
                    borderColor: selectedPlan.days === plan.days ? "#01c5fd" : undefined,
                  }}
                >
                  <div className="text-center">
                    <div className="font-bold text-base">{plan.days}일</div>
                    <div className="text-sm text-gray-600 mt-1">{plan.price.toLocaleString()}원</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 총 금액 및 예약하기 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-medium text-gray-700">총 금액</span>
            <span className="text-2xl font-bold" style={{ color: "#0c0c0c" }}>
              {selectedPlan.price.toLocaleString()}원
            </span>
          </div>
          <button
            onClick={handleBooking}
            className="w-full text-white font-bold py-4 rounded-lg text-lg transition-colors"
            style={{ backgroundColor: "#01c5fd" }}
          >
            예약하기
          </button>
        </div>

        {/* 모바일에서 푸터와 겹치지 않도록 하단 여백 추가 */}
        <div className="h-20"></div>
      </div>
    </>
  )
}

export default ProductDetail
