"use client";

import { useEffect, useState } from "react";
import WebComponentWrapper from "./web-component-wrapper";

interface IProps {
  env?: "production" | "development";
}

export default function TourvisPcFooter({ env = "production" }: IProps) {
  const [isDesktop, setIsDesktop] = useState(false);

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

  // PC 브라우저가 아니면 렌더링하지 않음
  if (!isDesktop) {
    return null;
  }

  return (
    <WebComponentWrapper
      tagName="footer-widget"
      attributes={{ env }}
      fallback={
        <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* 회사 정보 */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">TOURVIS</span>
                  <span className="text-sm text-purple-500 ml-1">2</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  여행의 모든 순간을 더욱 특별하게 만들어주는 TOURVIS입니다.<br />
                  안전하고 편리한 여행을 위한 최고의 서비스를 제공합니다.
                </p>
              </div>
              
              {/* 빠른 링크 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  빠른 링크
                </h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">회사소개</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">이용약관</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">개인정보처리방침</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm">고객센터</a></li>
                </ul>
              </div>
              
              {/* 연락처 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  연락처
                </h3>
                <ul className="space-y-2">
                  <li className="text-gray-600 text-sm">고객센터: 1588-0000</li>
                  <li className="text-gray-600 text-sm">이메일: help@tourvis.com</li>
                  <li className="text-gray-600 text-sm">운영시간: 09:00-18:00</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-8 pt-8">
              <p className="text-gray-500 text-sm text-center">
                © 2024 TOURVIS. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      }
    />
  );
}
