import React, { useEffect, useState } from 'react';
// 파일 확장자를 제거하여 오류를 수정했습니다.
import { ChevronLeft } from './ui/Icons';
import type { Product, DataOption, Plan } from '../lib/types';
// 서버 액션 대신 API Route 사용
import { universalEnv } from '@/env/universal-env';

interface ProductDetailProps {
    product: Product;
    onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
    const [selectedDataOption, setSelectedDataOption] = useState<DataOption>(product.options[0]);
    const [selectedPlan, setSelectedPlan] = useState<Plan>(product.options[0].plans[0]);
    const [apolloDetail, setApolloDetail] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [optionsFromApi, setOptionsFromApi] = useState<DataOption[] | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!product.apolloProductCode) return;
            try {
                setLoading(true);
                setError(null);
                const urls = [
                    `/api/product/${product.apolloProductCode}`,
                    `${universalEnv.basePath}/api/product/${product.apolloProductCode}`,
                    `api/product/${product.apolloProductCode}`,
                ];
                let data: any = null;
                let lastStatus: number | undefined;
                for (const url of urls) {
                    const res = await fetch(url, { cache: 'no-store' });
                    lastStatus = res.status;
                    if (res.ok) {
                        data = await res.json();
                        break;
                    }
                }
                if (!data) throw new Error(`api error ${lastStatus}`);
                setApolloDetail(data);
            } catch (e: any) {
                setError(e?.message ?? '상품 상세 조회 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [product.apolloProductCode]);

    // Apollo 상세 응답을 UI 옵션/가격으로 매핑
    useEffect(() => {
        if (!apolloDetail) return;

        function parseNumberMaybe(value: any): number | null {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
                const n = Number(value.replace(/[^0-9.-]/g, ''));
                return Number.isFinite(n) ? n : null;
            }
            return null;
        }

        function mapApolloDetailToOptions(detail: any): DataOption[] {
            // 후보 컬렉션을 광범위하게 탐색
            const candidateArrays: any[] = [];
            const keys = [
                'plans','planList','items','itemList','options','optionList',
                'productOptions','productOptionList','dataOptions','dataOptionList','priceList','feeList'
            ];
            keys.forEach((k) => {
                const v = detail?.[k];
                if (Array.isArray(v)) candidateArrays.push(v);
            });
            // 중첩 구조 내에서도 한 단계 더 찾아보기
            if (candidateArrays.length === 0) {
                Object.values(detail || {}).forEach((v: any) => {
                    if (Array.isArray(v)) candidateArrays.push(v);
                });
            }

            const flat: any[] = candidateArrays.flat().filter(Boolean);
            if (flat.length === 0) return [];

            type GroupMap = Record<string, Plan[]>;
            const groupedByDataLabel: GroupMap = {};

            for (const item of flat) {
                const dataLabel = (
                    item?.data || item?.dataLabel || item?.dataOptionName || item?.optionName || item?.quotaTypeName || '기본'
                ) as string;
                const days = (
                    item?.days ?? item?.period ?? item?.periodDays ?? item?.useDays ?? item?.validDays
                );
                const priceRaw = item?.price ?? item?.salePrice ?? item?.amount ?? item?.fee ?? item?.sellingPrice;
                const price = parseNumberMaybe(priceRaw);
                const dayNumber = parseNumberMaybe(days);
                if (price == null || dayNumber == null) continue;

                if (!groupedByDataLabel[dataLabel]) groupedByDataLabel[dataLabel] = [];
                groupedByDataLabel[dataLabel].push({ days: dayNumber, price });
            }

            const result: DataOption[] = Object.entries(groupedByDataLabel).map(([label, plans]) => ({
                data: label,
                plans: plans
                    .filter((p) => Number.isFinite(p.days) && Number.isFinite(p.price))
                    .sort((a, b) => a.days - b.days),
            }));

            // 유효한 옵션만 반환
            return result.filter((opt) => opt.plans.length > 0);
        }

        const derived = mapApolloDetailToOptions(apolloDetail);
        if (derived.length > 0) {
            setOptionsFromApi(derived);
            setSelectedDataOption(derived[0]);
            setSelectedPlan(derived[0].plans[0]);
        }
    }, [apolloDetail]);

    const optionsToRender: DataOption[] = optionsFromApi ?? product.options;

    const minPriceFromOptions = (() => {
        let min = Number.POSITIVE_INFINITY;
        for (const opt of optionsToRender) {
            for (const p of opt.plans) {
                if (p.price < min) min = p.price;
            }
        }
        return Number.isFinite(min) ? min : product.minPrice;
    })();

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
        <div className="w-full max-w-[750px] mx-auto px-4 pb-40">
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
                            {minPriceFromOptions.toLocaleString()}원
                        </p>
                        <p className="text-base text-gray-600">부터</p>
                    </div>
                </div>

                {product.apolloProductCode && (
                    <div className="mt-3 text-sm text-gray-600">
                        <div>상품 코드: {product.apolloProductCode}</div>
                        {loading && <div className="text-gray-500">상세 불러오는 중…</div>}
                        {error && <div className="text-red-600">{error}</div>}
                        {apolloDetail && (
                            <div className="mt-2">
                                <div className="font-medium">서버 상세 응답 요약</div>
                                <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto max-h-48">
{JSON.stringify(apolloDetail, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
                
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
                    {optionsToRender.map((option, index) => (
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
                            {option.data}
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
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
            
            {/* 모바일에서 푸터와 겹치지 않도록 하단 여백 추가 */}
            <div className="h-20"></div>
        </div>
    );
}

export default ProductDetail;
