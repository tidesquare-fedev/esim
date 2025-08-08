// src/data/mockData.js

export const mockCountriesData = [
    { id: 'JP', name: '일본', image: 'https://flagcdn.com/w320/jp.png', keywords: ['도쿄', '오사카', '후쿠오카'] },
    { id: 'VN', name: '베트남', image: 'https://flagcdn.com/w320/vn.png', keywords: ['다낭', '하노이', '호치민'] },
    { id: 'TH', name: '태국', image: 'https://flagcdn.com/w320/th.png', keywords: ['방콕', '치앙마이', '푸켓'] },
    { id: 'TW', name: '대만', image: 'https://flagcdn.com/w320/tw.png', keywords: ['타이페이', '가오슝'] },
    { id: 'HK', name: '홍콩', image: 'https://flagcdn.com/w320/hk.png', keywords: ['hongkong'] },
    { id: 'MO', name: '마카오', image: 'https://flagcdn.com/w320/mo.png', keywords: ['macao'] },
    { id: 'SG', name: '싱가포르', image: 'https://flagcdn.com/w320/sg.png', keywords: ['singapore'] },
    { id: 'MY', name: '말레이시아', image: 'https://flagcdn.com/w320/my.png', keywords: ['코타키나발루', '쿠알라룸푸르'] },
    { id: 'US', name: '미국', image: 'https://flagcdn.com/w320/us.png', keywords: ['뉴욕', 'LA', '하와이'] },
    { id: 'CA', name: '캐나다', image: 'https://flagcdn.com/w320/ca.png', keywords: ['토론토', '밴쿠버'] },
    { id: 'MX', name: '멕시코', image: 'https://flagcdn.com/w320/mx.png', keywords: ['칸쿤'] },
    { id: 'GB', name: '영국', image: 'https://flagcdn.com/w320/gb.png', keywords: ['런던'] },
    { id: 'FR', name: '프랑스', image: 'https://flagcdn.com/w320/fr.png', keywords: ['파리'] },
    { id: 'IT', name: '이탈리아', image: 'https://flagcdn.com/w320/it.png', keywords: ['로마', '피렌체'] },
    { id: 'ES', name: '스페인', image: 'https://flagcdn.com/w320/es.png', keywords: ['마드리드', '바르셀로나'] },
    { id: 'DE', name: '독일', image: 'https://flagcdn.com/w320/de.png', keywords: ['베를린', '뮌헨'] },
];

// 상품 데이터 구조를 2단계 옵션 선택에 맞게 변경했습니다.
export const mockProductsData = [
    { 
        id: 'P001', 
        name: '일본 eSIM (소프트뱅크)', 
        provider: 'ROKE', 
        minPrice: 3300, 
        supportedCountries: ['JP'], 
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
];

