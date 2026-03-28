import type {
  Product,
  ProductDetail,
  TermsDocument,
  TermsKey,
} from "@/lib/types";

export const CATEGORY_LABELS = {
  FOOD: "식품",
  BEAUTY: "뷰티",
  DRINK: "음료",
  MEAL_KIT: "간편식",
  OTHER: "기타",
} as const;

export const STATUS_LABELS = {
  ON_SALE: "판매중",
  EXPIRY_SOON: "임박특가",
  SOLD_OUT: "품절",
  EXPIRED: "만료",
  DELETED: "삭제",
} as const;

export const ORDER_STATUS_STEPS = [
  "PENDING",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
] as const;

export const ORDER_STATUS_LABELS = {
  PENDING: "주문완료",
  PREPARING: "준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소됨",
} as const;

export const SORT_OPTIONS = [
  { value: "expiry_asc", label: "마감임박순" },
  { value: "discount_desc", label: "할인율순" },
  { value: "price_asc", label: "가격낮은순" },
  { value: "price_desc", label: "가격높은순" },
] as const;

export const SELLER_ORDER_STATUS_OPTIONS = [
  { value: "PREPARING", label: "배송 준비" },
  { value: "SHIPPING", label: "배송 중" },
  { value: "DELIVERED", label: "배송 완료" },
] as const;

export const EXPLORE_PAGE_SIZE = 3;

export const SELLER_EDITABLE_FIELDS = [
  { key: "name", label: "상품명", type: "text" },
  { key: "originalPrice", label: "가격", type: "number" },
  { key: "stock", label: "재고", type: "number" },
  { key: "expiryDate", label: "유통기한", type: "date" },
] as const;

export const TERMS_DATA: Record<TermsKey, TermsDocument> = {
  terms: {
    title: "이용약관",
    badge: "필수",
    lastUpdated: "2025년 1월 1일",
    sections: [
      {
        heading: "제1조 (목적)",
        body: "이 약관은 C-commerce(이하 '회사')가 제공하는 서비스(이하 '서비스')의 이용에 관한 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
      },
      {
        heading: "제2조 (정의)",
        body: "'이용자'란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.\n'회원'이란 회사에 개인정보를 제공하여 회원 등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.",
      },
      {
        heading: "제3조 (약관의 효력 및 변경)",
        body: "이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 이 약관을 변경할 수 있으며, 변경 시 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 초기화면에 7일 이전부터 공지합니다.",
      },
      {
        heading: "제4조 (서비스 이용)",
        body: "서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다. 회사는 서비스를 일정범위로 분할하여 각 범위별로 이용 가능 시간을 별도로 지정할 수 있으며, 이 경우 그 내용을 사전에 공지합니다.",
      },
      {
        heading: "제5조 (서비스 이용의 제한)",
        body: "회사는 이용자가 다음 각 호의 사유에 해당하는 경우 서비스 이용을 제한하거나 중단시킬 수 있습니다. 서비스 운영을 고의로 방해한 경우, 타인의 명예를 손상시키거나 불이익을 주는 행위를 한 경우, 저작권법 및 관련 법령을 위반한 경우.",
      },
    ],
  },
  privacy: {
    title: "개인정보 처리방침",
    badge: "필수",
    lastUpdated: "2025년 1월 1일",
    sections: [
      {
        heading: "1. 수집하는 개인정보 항목",
        body: "회사는 회원가입, 서비스 이용 등을 위해 아래와 같은 개인정보를 수집합니다.\n\n[필수항목] 이름, 이메일 주소, 비밀번호\n[자동수집] 접속 IP, 접속 시간, 서비스 이용 기록, 기기 정보",
      },
      {
        heading: "2. 개인정보의 수집 및 이용 목적",
        body: "수집한 개인정보는 다음의 목적을 위해 활용합니다.\n\n• 서비스 제공 및 계약 이행: 주문 및 배송 처리, 결제 서비스 제공\n• 회원 관리: 회원제 서비스 이용에 따른 본인 확인, 개인식별\n• 마케팅 및 광고 활용: 신규 서비스 개발, 이벤트 등 광고성 정보 제공(별도 동의 시)",
      },
      {
        heading: "3. 개인정보의 보유 및 이용기간",
        body: "이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 보관합니다.\n\n• 계약 또는 청약철회 등에 관한 기록: 5년\n• 대금결제 및 재화 등의 공급에 관한 기록: 5년",
      },
      {
        heading: "4. 개인정보의 제3자 제공",
        body: "회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.\n\n• 이용자들이 사전에 동의한 경우\n• 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우",
      },
      {
        heading: "5. 이용자의 권리",
        body: "이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다. 이용자의 개인정보 조회, 수정을 위해서는 '개인정보변경'을, 가입해지를 위해서는 '회원탈퇴'를 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.",
      },
    ],
  },
  marketing: {
    title: "마케팅 정보 수신 동의",
    badge: "선택",
    lastUpdated: "2025년 1월 1일",
    sections: [
      {
        heading: "마케팅 정보 수신 동의 안내",
        body: "C-commerce는 이용자의 소중한 개인정보를 활용하여 다양한 혜택과 정보를 제공하고자 합니다. 아래 내용을 확인하신 후 동의 여부를 선택해 주세요.",
      },
      {
        heading: "수집 항목",
        body: "이름, 이메일 주소, 서비스 이용 기록, 구매 내역",
      },
      {
        heading: "이용 목적",
        body: "• 신규 서비스 및 상품 출시 안내\n• 이벤트, 프로모션, 할인 정보 제공\n• 임박 특가 상품 알림\n• 개인화된 상품 추천 서비스 제공\n• 설문조사 및 리뷰 요청",
      },
      {
        heading: "보유 및 이용 기간",
        body: "동의일로부터 마케팅 수신 동의 철회 시까지. 단, 관계 법령에 따라 별도 보존이 필요한 경우 해당 기간 동안 보존합니다.",
      },
      {
        heading: "수신 채널",
        body: "• 이메일\n• 앱 푸시 알림\n• SMS/MMS",
      },
      {
        heading: "동의 거부 권리 및 불이익",
        body: "마케팅 정보 수신 동의는 선택사항으로, 동의하지 않더라도 C-commerce의 기본 서비스 이용에는 제한이 없습니다. 다만, 동의하지 않으실 경우 각종 혜택, 이벤트, 임박 특가 알림 등의 마케팅 정보를 받으실 수 없습니다.",
      },
    ],
  },
};

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
