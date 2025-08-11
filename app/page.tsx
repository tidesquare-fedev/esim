'use client'; // 클라이언트 컴포넌트로 지정

import React, { useState, useEffect } from 'react';
import { mockCountriesData, mockProductsData } from '@/lib/data';
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

  const [heroImages, setHeroImages] = useState({
    pcImages: [
      {
        id: 1,
        image_url: `${universalEnv.basePath}/placeholder.svg?height=600&width=1200&text=Hero+Image+1`,
      },
    ],
    mobileImages: [
      {
        id: 1,
        image_url: `${universalEnv.basePath}/placeholder.svg?height=600&width=1200&text=Hero+Image+1`,
      },
    ],
  });

  const [view, setView] = useState('countrySelector');
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCountriesSelect = (countries: Country[]) => {
    setSelectedCountries(countries);
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
        return <ProductList selectedCountries={selectedCountries} products={mockProductsData} onProductSelect={handleProductSelect} onBack={handleBack} />;
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
