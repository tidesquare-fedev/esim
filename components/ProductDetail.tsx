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
        <div className="p-4 md:p-6">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 truncate">{product.name}</h1>
            </div>

            <div className="bg-white p-5 rounded-lg border border-gray-200 mb-8">
                <p className="text-sm text-custom-blue font-semibold">{product.provider}</p>
                <h2 className="text-xl font-bold mt-1">{product.name}</h2>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">1. 데이터 옵션 선택</h3>
                <div className="flex flex-wrap gap-3">
                    {product.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleDataOptionSelect(option)}
                            className={`px-4 py-2 border rounded-full text-base font-medium transition-colors ${selectedDataOption.data === option.data ? 'bg-custom-blue text-white border-custom-blue' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {option.data}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-4">2. 사용 기간 선택</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedDataOption.plans.map((plan, index) => (
                        <div
                            key={index}
                            onClick={() => handlePlanSelect(plan)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${JSON.stringify(selectedPlan) === JSON.stringify(plan) ? 'bg-blue-50 border-custom-blue ring-2 ring-blue-300' : 'bg-white border-gray-300 hover:border-gray-400'}`}
                        >
                            <p className="font-bold text-gray-800">{plan.days}일</p>
                            <p className="text-right font-bold text-lg mt-2 text-gray-900">{plan.price.toLocaleString()}원</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-12">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 text-lg">총 금액</span>
                    <span className="text-2xl font-extrabold text-custom-blue">{selectedPlan.price.toLocaleString()}원</span>
                </div>
                <button
                    onClick={handleBooking}
                    className="w-full bg-custom-blue text-white font-bold py-4 rounded-lg text-lg hover:brightness-95 transition"
                >
                    예약하기
                </button>
            </div>
        </div>
    );
}

export default ProductDetail;
