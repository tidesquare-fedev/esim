import React from 'react';
import { X } from './ui/Icons';
import Link from 'next/link';

interface GuidePopupProps {
  onClose: () => void;
}

const GuidePopup: React.FC<GuidePopupProps> = ({ onClose }) => {
    return (
        // 배경(Backdrop)
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            {/* 팝업 컨텐츠 */}
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // 팝업 내부 클릭 시 닫히지 않도록 이벤트 전파 차단
            >
                {/* 헤더 */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">eSIM 이용 가이드</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="p-6 space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-custom-blue mb-2">🤔 eSIM, 그게 뭔가요?</h3>
                        <p className="text-gray-700">
                            eSIM(embedded SIM)은 기존의 플라스틱 유심칩과 달리, 스마트폰에 내장된 디지털 SIM입니다. QR코드 스캔 한 번이면 간편하게 개통되어 바로 데이터를 사용할 수 있습니다.
                        </p>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-semibold text-custom-blue mb-2">📱 내 휴대폰이 사용 가능한가요?</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold text-gray-800 mb-3">5초 만에 확인하는 방법</p>
                            <ol className="space-y-2 text-gray-700">
                                <li className="flex items-start">
                                    <span className="font-bold text-custom-blue mr-2">1.</span>
                                    <span>스마트폰 기본 전화 앱의 키패드 화면에서<br/> <code className="bg-gray-200 text-gray-800 font-mono py-1 px-2 rounded-md text-base">*#06#</code> 을 입력하세요.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold text-custom-blue mr-2">2.</span>
                                    <span>표시된 기기 정보에 'EID' 항목이 있으면 사용 가능합니다.</span>
                                </li>
                            </ol>
                            <p className="mt-3 text-xs text-gray-500">* MEID 또는 IMEI만 표시되는 경우 eSIM 사용이 불가할 수 있습니다.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-custom-blue mb-2">👍 왜 eSIM을 사용해야 할까요?</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li><span className="font-semibold">간편함:</span> 유심칩을 교체할 필요 없이 QR코드로 즉시 개통!</li>
                            <li><span className="font-semibold">안전함:</span> 분실이나 파손의 위험이 없어요.</li>
                            <li><span className="font-semibold">효율성:</span> 기존 한국 유심과 함께 사용하여 전화/문자 수신이 가능해요.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-custom-blue mb-2">⚙️ 어떻게 사용하나요?</h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                            <li><span className="font-semibold">eSIM 구매하기:</span> 원하는 상품을 선택하고 결제를 완료합니다.</li>
                            <li><span className="font-semibold">QR코드 받기:</span> 이메일 또는 앱에서 QR코드를 확인합니다.</li>
                            <li><span className="font-semibold">eSIM 등록하기:</span> 스마트폰 설정에서 QR코드를 스캔하여 eSIM을 추가합니다.</li>
                            <li><span className="font-semibold">데이터 사용 설정:</span> 해외 도착 후, 데이터 로밍을 구매한 eSIM으로 설정하면 끝!</li>
                        </ol>
                    </section>

                    <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">📢 이용 전 꼭 확인하세요!</h3>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700">
                            <li>사용하시는 스마트폰이 eSIM을 지원하는 모델인지 꼭 확인해주세요.</li>
                            <li>'컨트리락(Country Lock)'이 해제된 기기에서만 사용 가능합니다.</li>
                            <li>
                                <Link href={'https://tourvis.com/promotion/ts/631'} className="underline" target="_blank">
                                    자세한 내용 확인 하러 가기
                                </Link>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default GuidePopup;
