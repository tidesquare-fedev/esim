'use client'; // 클라이언트 컴포넌트로 지정

import React, { useState, useEffect } from 'react';
import { mockCountriesData, countryProductCodeMap, asiaCommonCountries, asiaCommonProductCode } from '@/lib/data';
import type { Country, Product } from '@/lib/types';
import CountrySelector from '@/components/CountrySelector';
import ProductList from '@/components/ProductList';
import ProductDetail from '@/components/ProductDetail';

const deviceAgentCode = (userAgent: string) => {
  const isMobileAppCheck = (_agent: string) => {
    const agent = _agent.toLowerCase();

    const isAndroid = agent.includes("tourvis_android_app");
    const isIOS = agent.includes("tourvis_ios_app");

    // 모바일 기기인지 간단한 정규식으로 판단
    const isMobile =
      /iphone|ipad|ipod|android|blackberry|iemobile|opera mini|mobile/i.test(
        agent
      );

    if (isIOS) return "IOS";
    if (isAndroid) return "Android";
    if (isMobile) return "Mobile";
    return "Web";
  };

  const mode = {
    IOS: "A",
    Android: "A",
    Mobile: "M",
    Web: "P",
  };

  return mode[isMobileAppCheck(userAgent)] as "M" | "A" | "P";
};

const HomePage = () => {
  const [deviceCode, setDeviceCode] = useState<"M" | "A" | "P">("P");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const code = deviceAgentCode(userAgent);
    setDeviceCode(code);
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      // 화면 너비가 768px 이상이면 데스크톱으로 간주
      const isDesktopSize = window.innerWidth >= 768;
      // User Agent로 모바일 기기 체크
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      setIsDesktop(isDesktopSize && !isMobileDevice);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const [heroImages, setHeroImages] = useState<{ pcImages: { id: number; image_url: string }[]; mobileImages: { id: number; image_url: string }[] }>({
    pcImages: [],
    mobileImages: [],
  });

  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await fetch('/marketing/esim/api/hero', { cache: 'no-store' }).then(r => r.json());
        setHeroImages(res);
      } catch (e) {
        // 실패 시 placeholder 유지
        setHeroImages({
          pcImages: [
            { id: 1, image_url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/placeholder.svg?height=600&width=1200&text=Hero+Image` },
          ],
          mobileImages: [
            { id: 1, image_url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/placeholder.svg?height=600&width=1200&text=Hero+Image` },
          ],
        });
      }
    };
    loadHero();
  }, []);

  const [view, setView] = useState('countrySelector');
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [derivedProducts, setDerivedProducts] = useState<Product[]>([]);

  const handleCountriesSelect = (countries: Country[]) => {
    setSelectedCountries(countries);

    // 선택한 국가에 따른 상품 묶음 생성 (Apollo 코드 기준으로 통합)
    const selectedIds = countries.map(c => c.id);

    const codeToProduct: Record<string, Product> = {};

    // 1) 단일/공유 코드 매핑 상품 생성
    for (const country of countries) {
      const code = countryProductCodeMap[country.id];
      if (!code) continue;
      if (!codeToProduct[code]) {
        codeToProduct[code] = {
          id: code,
          name: `${country.name} eSIM`,
          provider: 'Apollo',
          minPrice: 0,
          supportedCountries: [country.id],
          apolloProductCode: code,
          options: [],
        };
      } else {
        // 같은 코드(예: 미국/캐나다 등) 통합
        if (!codeToProduct[code].supportedCountries.includes(country.id)) {
          codeToProduct[code].supportedCountries.push(country.id);
        }
        // 이름은 다중 국가면 첫 국가명 유지
      }
    }

    // 2) 아시아 교체 공통 상품 노출 조건
    const hasAsiaCommon = selectedIds.some(id => asiaCommonCountries.includes(id));
    if (hasAsiaCommon) {
      const asiaCode = asiaCommonProductCode;
      const asiaSupported = selectedIds.filter(id => asiaCommonCountries.includes(id));
      codeToProduct[asiaCode] = {
        id: asiaCode,
        name: '아시아 교체용 eSIM',
        provider: 'Apollo',
        minPrice: 0,
        supportedCountries: asiaSupported,
        apolloProductCode: asiaCode,
        options: [],
      };
    }

    const products = Object.values(codeToProduct);
    setDerivedProducts(products);
    setView('productList');
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setView('productDetail');
  };

  const handleBack = () => {
    if (view === 'productDetail') {
      setView('productList');
    } else if (view === 'productList') {
      setView('countrySelector');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'countrySelector':
        return <CountrySelector countries={mockCountriesData} onCountriesSelect={handleCountriesSelect} />;
      case 'productList':
        return <ProductList selectedCountries={selectedCountries} products={derivedProducts} onProductSelect={handleProductSelect} onBack={handleBack} />;
      case 'productDetail':
        if (!selectedProduct) return null; // 또는 로딩/에러 처리
        return <ProductDetail product={selectedProduct} onBack={handleBack} />;
      default:
        return <CountrySelector countries={mockCountriesData} onCountriesSelect={handleCountriesSelect} />;
    }
  };

  return (
    <main>
      {renderView()}
    </main>
  );
}

export default HomePage;
