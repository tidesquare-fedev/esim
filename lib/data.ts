// src/data/mockData.js

export const mockCountriesData = [
    { id: 'JP', name: '일본', image: 'https://flagcdn.com/w320/jp.png', keywords: [] },
    { id: 'VN', name: '베트남', image: 'https://flagcdn.com/w320/vn.png', keywords: [] },
    { id: 'TW', name: '대만', image: 'https://flagcdn.com/w320/tw.png', keywords: [] },
    { id: 'TH', name: '태국', image: 'https://flagcdn.com/w320/th.png', keywords: [] },
    { id: 'SG', name: '싱가포르', image: 'https://flagcdn.com/w320/sg.png', keywords: [] },
    { id: 'CN', name: '중국', image: 'https://flagcdn.com/w320/cn.png', keywords: [] },
    { id: 'HK', name: '홍콩', image: 'https://flagcdn.com/w320/hk.png', keywords: [] },
    { id: 'MO', name: '마카오', image: 'https://flagcdn.com/w320/mo.png', keywords: [] },
    { id: 'PH', name: '필리핀', image: 'https://flagcdn.com/w320/ph.png', keywords: [] },
    { id: 'GU', name: '괌', image: 'https://flagcdn.com/w320/gu.png', keywords: [] },
    { id: 'MP', name: '사이판', image: 'https://flagcdn.com/w320/mp.png', keywords: [] },
    { id: 'US', name: '미국', image: 'https://flagcdn.com/w320/us.png', keywords: [] },
    { id: 'CA', name: '캐나다', image: 'https://flagcdn.com/w320/ca.png', keywords: [] },
    { id: 'FR', name: '프랑스', image: 'https://flagcdn.com/w320/fr.png', keywords: [] },
    { id: 'ES', name: '스페인', image: 'https://flagcdn.com/w320/es.png', keywords: [] },
    { id: 'IT', name: '이탈리아', image: 'https://flagcdn.com/w320/it.png', keywords: [] },
    { id: 'AU', name: '호주', image: 'https://flagcdn.com/w320/au.png', keywords: [] },
    { id: 'NZ', name: '뉴질랜드', image: 'https://flagcdn.com/w320/nz.png', keywords: [] },
];

// 선택 국가 → Apollo 상품 코드 매핑
export const countryProductCodeMap: Record<string, string> = {
    JP: 'PRD3000275015',
    VN: 'PRD3000301636',
    TW: 'PRD3000277916',
    TH: 'PRD3000275279',
    SG: 'PRD3001418859',
    CN: 'PRD3000301768',
    HK: 'PRD3000301768',
    MO: 'PRD3000301768',
    PH: 'PRD3000275770',
    GU: 'PRD3000277979',
    MP: 'PRD3000277979',
    US: 'PRD3000279148',
    CA: 'PRD3000279148',
    FR: 'PRD3000267057',
    ES: 'PRD3000267057',
    IT: 'PRD3000267057',
    AU: 'PRD3000325457',
    NZ: 'PRD3000325457',
}

// 아시아 교체 공통 상품
export const asiaCommonProductCode = 'PRD3000275848'
export const asiaCommonCountries: string[] = ['TW', 'MO', 'VN', 'SG', 'TH', 'PH', 'JP', 'CN', 'HK']

// 상품 데이터 구조를 2단계 옵션 선택에 맞게 변경했습니다.
export const mockProductsData = [
    { 
        id: 'P001', 
        name: '일본 eSIM (소프트뱅크)', 
        provider: 'ROKE', 
        minPrice: 3300, 
        supportedCountries: ['JP'], 
        apolloProductCode: 'PRD2001354649',
        options: [
            { 
                data: '매일 1GB', 
                plans: [ { days: 3, price: 3300 }, { days: 5, price: 5500 }, { days: 7, price: 7700 } ] 
            },
            { 
                data: '매일 2GB', 
                plans: [ { days: 3, price: 4300 }, { days: 5, price: 6500 } ] 
            }
        ]
    },
    { 
        id: 'P002', 
        name: '아시아 8개국 통합 eSIM', 
        provider: 'GlobalSim', 
        minPrice: 7900, 
        supportedCountries: ['JP', 'VN', 'TH', 'TW', 'HK', 'MO', 'SG', 'MY'],
        apolloProductCode: undefined,
        options: [
            {
                data: '500MB/일 제공',
                plans: [ { days: 8, price: 7900 }, { days: 12, price: 10900 } ]
            },
            {
                data: '1GB/일 제공',
                plans: [ { days: 8, price: 9900 }, { days: 12, price: 13900 }, { days: 15, price: 16500 } ]
            },
            {
                data: '무제한',
                plans: [ { days: 5, price: 18000 }, { days: 7, price: 24000 } ]
            }
        ]
    },
    { 
        id: 'P003', 
        name: '미주 (미국/캐나다) eSIM', 
        provider: 'AmericaSim', 
        minPrice: 12500, 
        supportedCountries: ['US', 'CA'],
        apolloProductCode: undefined,
        options: [
            {
                data: '총 5GB',
                plans: [ { days: 7, price: 12500 }, { days: 15, price: 18000 } ]
            },
            {
                data: '총 10GB',
                plans: [ { days: 15, price: 22000 }, { days: 30, price: 32000 } ]
            }
        ]
    },
    {
        id: 'P004',
        name: '베트남 eSIM (API)',
        provider: 'Apollo',
        minPrice: 0,
        supportedCountries: ['VN'],
        apolloProductCode: 'PRD2001354649',
        options: [
            {
                data: 'API 연동 상품',
                plans: [ { days: 0, price: 0 } ]
            }
        ]
    },
];

