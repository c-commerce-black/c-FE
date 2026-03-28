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

export const SORT_OPTIONS = [
  { value: "expiry_asc", label: "마감임박순" },
  { value: "discount_desc", label: "할인율순" },
  { value: "price_asc", label: "가격낮은순" },
  { value: "price_desc", label: "가격높은순" },
] as const;

export const EXPLORE_PAGE_SIZE = 3;
