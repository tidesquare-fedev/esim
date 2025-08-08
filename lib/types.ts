// lib/types.ts
// 공용으로 사용할 타입들을 정의합니다.

export interface Country {
  id: string;
  name: string;
  image: string;
  keywords: string[];
}

export interface Plan {
  days: number;
  price: number;
}

export interface DataOption {
  data: string;
  plans: Plan[];
}

export interface Product {
  id: string;
  name: string;
  provider: string;
  minPrice: number;
  supportedCountries: string[];
  options: DataOption[];
}
