"use client";

import { useEffect, useState } from "react";

export {};

declare global {
  interface Window {
    kakao?: any;
    Kakao: KakaoSDK;
  }
}

export interface KakaoShareSeo {
  imgUrl?: string;
  description: string;
  title: string;
}

export interface KakaoSDK {
  init: (key: string | undefined) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (params: {
      objectType: string;
      content: {
        title: string | undefined;
        description: string | undefined;
        imageUrl: string | undefined;
        link: {
          mobileWebUrl: string;
          webUrl: string;
        };
      };
      buttons: [
        {
          title: string;
          link: {
            mobileWebUrl: string;
            webUrl: string;
          };
        }
      ];
    }) => void;
  };
}

export const useKakaoShare = (
  shareAble: boolean = true
): {
  onShareKakao: (seo?: KakaoShareSeo) => void;
  isKakaoScriptLoaded: boolean;
} => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptError, setIsScriptError] = useState(false);

  const isKakaoSdkReady = () =>
    typeof window !== "undefined" &&
    typeof window.Kakao?.init === "function" &&
    typeof window.Kakao?.isInitialized === "function";

  const initKakao = () => {
    if (!isKakaoSdkReady()) {
      console.log(
        "카카오 SDK가 아직 준비되지 않았습니다. 0.5초 후 재시도합니다."
      );
      setTimeout(initKakao, 500);
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init("96689f2b13eb9c7747811cc0db70ebd6");
      console.log("✅ Kakao SDK 초기화 완료");
    }
  };

  // 카카오 SDK 로드
  useEffect(() => {
    if (!shareAble) {
      setIsScriptLoaded(false);
      return;
    }

    if (isKakaoSdkReady()) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      initKakao();
    };
    script.onerror = (err) => {
      console.error("❌ Kakao SDK 로드 실패:", err);
      setIsScriptError(true);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [shareAble]);

  const getImgUrl = (seo?: KakaoShareSeo) => {
    if (!seo) return "";
    if (!seo.imgUrl) {
      return "https://tourvis.com/images/common/tourvis_logo_og.jpg";
    }
    return seo.imgUrl.startsWith("http") ? seo.imgUrl : `https:${seo.imgUrl}`;
  };

  const onShareKakao = (seo?: KakaoShareSeo) => {
    if (
      !isScriptLoaded ||
      typeof window === "undefined" ||
      !window.Kakao?.isInitialized()
    ) {
      alert("카카오톡 공유 준비 중입니다.\n잠시 후 다시 시도해주세요.");
      return;
    }

    const { href, origin, pathname } = window.location;
    const isProductDetailPage = href.includes("/activity/product");
    const isPromotionPage = href.includes("/promotion");
    const url =
      isProductDetailPage || isPromotionPage ? origin + pathname : href;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: seo?.title ?? "",
        description: seo?.description ?? "",
        imageUrl: getImgUrl(seo),
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: "웹으로 이동",
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
  };

  return {
    onShareKakao,
    isKakaoScriptLoaded: isScriptLoaded && !isScriptError,
  };
};

export default useKakaoShare;
