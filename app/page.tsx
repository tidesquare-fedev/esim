'use client'; // 클라이언트 컴포넌트로 지정

import React, { useState } from 'react';
import { mockCountriesData, mockProductsData } from '@/lib/data';
import type { Country, Product } from '@/lib/types';
import CountrySelector from '@/components/CountrySelector';
import ProductList from '@/components/ProductList';
import ProductDetail from '@/components/ProductDetail';

export default function HomePage() {
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
