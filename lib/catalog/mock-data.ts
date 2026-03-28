import type { Product, ProductDetail } from "./types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-banana",
    name: "유기농 바나나 1송이",
    category: "FOOD",
    originalPrice: 12900,
    currentPrice: 8900,
    discountRate: 31,
    stock: 24,
    expiryDate: "2026-03-29",
    status: "EXPIRY_SOON",
    dDay: 1,
    imageUrl: null,
  },
  {
    id: "mock-salad",
    name: "당일수확 샐러드 채소",
    category: "FOOD",
    originalPrice: 9800,
    currentPrice: 6400,
    discountRate: 35,
    stock: 42,
    expiryDate: "2026-03-30",
    status: "EXPIRY_SOON",
    dDay: 2,
    imageUrl: null,
  },
  {
    id: "mock-egg",
    name: "무항생제 계란 15구",
    category: "FOOD",
    originalPrice: 7500,
    currentPrice: 4900,
    discountRate: 34,
    stock: 31,
    expiryDate: "2026-03-29",
    status: "EXPIRY_SOON",
    dDay: 1,
    imageUrl: null,
  },
  {
    id: "mock-salmon",
    name: "생연어 스테이크 300g",
    category: "MEAL_KIT",
    originalPrice: 18900,
    currentPrice: 12900,
    discountRate: 32,
    stock: 12,
    expiryDate: "2026-04-01",
    status: "ON_SALE",
    dDay: 3,
    imageUrl: null,
  },
];

export const MOCK_PRODUCT_DETAILS: Record<string, ProductDetail> = {
  "mock-banana": {
    ...MOCK_PRODUCTS[0],
    description: "친환경 농법으로 재배한 바나나를 임박특가로 준비했습니다.",
    seller: {
      id: "seller-mock",
      shopName: "신선한 하루",
    },
    priceHistory: [
      { dDay: 7, price: 11900 },
      { dDay: 5, price: 10900 },
      { dDay: 3, price: 9900 },
      { dDay: 1, price: 8900 },
    ],
  },
  "mock-salad": {
    ...MOCK_PRODUCTS[1],
    description: "오늘 수확한 샐러드 채소를 바로 배송합니다.",
    seller: {
      id: "seller-mock",
      shopName: "당일농장",
    },
    priceHistory: [
      { dDay: 7, price: 8900 },
      { dDay: 5, price: 7900 },
      { dDay: 3, price: 6900 },
      { dDay: 2, price: 6400 },
    ],
  },
  "mock-egg": {
    ...MOCK_PRODUCTS[2],
    description: "무항생제 인증 계란을 한정 수량으로 제공합니다.",
    seller: {
      id: "seller-mock",
      shopName: "계란연구소",
    },
    priceHistory: [
      { dDay: 6, price: 6900 },
      { dDay: 4, price: 5900 },
      { dDay: 2, price: 5200 },
      { dDay: 1, price: 4900 },
    ],
  },
  "mock-salmon": {
    ...MOCK_PRODUCTS[3],
    description: "고단백 연어 스테이크를 손질해 바로 조리할 수 있습니다.",
    seller: {
      id: "seller-mock",
      shopName: "씨푸드 마켓",
    },
    priceHistory: [
      { dDay: 10, price: 17900 },
      { dDay: 7, price: 15900 },
      { dDay: 4, price: 13900 },
      { dDay: 3, price: 12900 },
    ],
  },
};
