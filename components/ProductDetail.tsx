import React, { useState } from 'react';
// 파일 확장자를 제거하여 오류를 수정했습니다.
import { ChevronLeft } from './ui/Icons';
import type { Product, DataOption, Plan } from '../lib/types';

interface ProductDetailProps {
    product: Product;
    onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
    const [selectedDataOption, setSelectedDataOption] = useState<DataOption>(product.options[0]);
    const [selectedPlan, setSelectedPlan] = useState<Plan>(product.options[0].plans[0]);

    const handleDataOptionSelect = (option: DataOption) => {
        setSelectedDataOption(option);
        setSelectedPlan(option.plans[0]);
    };

    const handlePlanSelect = (plan: Plan) => {
        setSelectedPlan(plan);
        // 선택된 플랜을 콘솔에 출력 (디버깅용)
        console.log('선택된 플랜:', plan);
    };

    const handleBooking = () => {
        const bookingInfo = {
            productId: product.id,
            productName: product.name,
            dataOption: selectedDataOption.data,
            plan: selectedPlan,
            totalPrice: selectedPlan.price
        };
        console.log("예약 정보:", bookingInfo);
        alert(`예약 페이지로 이동합니다.\n상품: ${bookingInfo.productName}\n옵션: ${bookingInfo.dataOption}, ${bookingInfo.plan.days}일\n가격: ${bookingInfo.totalPrice.toLocaleString()}원`);
    };

    return (
        <div className="w-full max-w-[750px] mx-auto px-4">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 truncate">
                    {product.name}
                </h1>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                        <p className="text-base text-gray-500">{product.provider}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: '#0c0c0c' }}>
                            {product.minPrice.toLocaleString()}원
                        </p>
                        <p className="text-base text-gray-600">부터</p>
                    </div>
                </div>
                
                <div className="mb-4">
                    <p className="text-base text-gray-600 mb-2">지원 국가:</p>
                    <div className="flex flex-wrap gap-2">
                        {product.supportedCountries.map(country => (
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
                <div className="flex gap-3">
                    {product.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleDataOptionSelect(option)}
                                                         className={`px-4 py-2 rounded-full text-base font-medium transition-colors ${
                                 selectedDataOption.data === option.data
                                     ? 'text-white'
                                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                             }`}
                             style={{
                                 backgroundColor: selectedDataOption.data === option.data ? '#01c5fd' : undefined
                             }}
                        >
                            {option.data === '500MB' ? '500MB/일 제공' : 
                             option.data === '1GB' ? '1GB/일 제공' : '무제한'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. 사용 기간 선택 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">2. 사용 기간 선택</h3>
                <div className="bg-gray-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-4">
                        {selectedDataOption.plans.map((plan, index) => (
                            <button
                                key={index}
                                onClick={() => handlePlanSelect(plan)}
                                                                 className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                                     selectedPlan.days === plan.days
                                         ? 'text-gray-900 border scale-105'
                                         : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:scale-105'
                                 }`}
                                 style={{
                                     borderColor: selectedPlan.days === plan.days ? '#01c5fd' : undefined
                                 }}
                            >
                                                                    <div className="text-center">
                                        <div className="font-bold text-base">{plan.days}일</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {plan.price.toLocaleString()}원
                                        </div>
                                    </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 총 금액 및 예약하기 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-medium text-gray-700">총 금액</span>
                    <span className="text-2xl font-bold" style={{ color: '#0c0c0c' }}>
                        {selectedPlan.price.toLocaleString()}원
                    </span>
                </div>
                <button
                    onClick={handleBooking}
                    className="w-full text-white font-bold py-4 rounded-lg text-lg transition-colors"
                    style={{ backgroundColor: '#01c5fd' }}
                >
                    예약하기
                </button>
            </div>
        </div>
    );
}

export default ProductDetail;
