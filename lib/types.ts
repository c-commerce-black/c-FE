export type Role = "BUYER" | "SELLER" | "ADMIN";

export type ProductCategory =
  | "FOOD"
  | "BEAUTY"
  | "DRINK"
  | "MEAL_KIT"
  | "OTHER";

export type ProductStatus =
  | "ON_SALE"
  | "EXPIRY_SOON"
  | "SOLD_OUT"
  | "EXPIRED"
  | "DELETED";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type SellerOrderStatus = Exclude<OrderStatus, "PENDING" | "CANCELLED">;

export type ApiErrorPayload = {
  message: string;
  statusCode: number;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiErrorPayload;
    };

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type User = {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  shopName?: string | null;
};

export type SellerPreview = {
  id: string;
  shopName: string;
};

export type PricePoint = {
  dDay: number;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  originalPrice: number;
  currentPrice: number;
  discountRate: number;
  stock: number;
  expiryDate: string;
  status: ProductStatus;
  dDay: number;
  imageUrl?: string | null;
};

export type ProductDetail = Product & {
  description?: string | null;
  seller?: SellerPreview | null;
  priceHistory?: PricePoint[];
};

export type SellerProduct = {
  id: string;
  name: string;
  currentPrice: number;
  stock: number;
  expiryDate: string;
  status: ProductStatus;
  todaySoldCount: number;
};

export type CartItem = {
  cartItemId?: string;
  id?: string;
  quantity: number;
  product: Pick<
    Product,
    | "id"
    | "name"
    | "currentPrice"
    | "originalPrice"
    | "status"
    | "imageUrl"
    | "dDay"
    | "discountRate"
  >;
};

export type CartSummary = {
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
};

export type CartState = {
  items: CartItem[];
  summary: CartSummary;
  priceChanged: boolean;
};

export type OrderItem = {
  productId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  price: number;
  dDay?: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  shippingAddress: string;
  createdAt: number;
  updatedAt?: number;
  items: OrderItem[];
};

export type AlertProduct = {
  id: string;
  name: string;
  currentPrice: number;
  status: ProductStatus;
  remainSeconds: number;
};

export type AlertItem = {
  alertId: string | null;
  isOn: boolean;
  product: AlertProduct;
};

export type TermsKey = "terms" | "privacy" | "marketing";

export type TermsSection = {
  heading: string;
  body: string;
};

export type TermsDocument = {
  title: string;
  badge: "필수" | "선택";
  lastUpdated: string;
  sections: TermsSection[];
};

export type ProductListData = {
  products: Product[];
  pagination: Pagination;
};

export type ExploreFilters = {
  category: string;
  sort: string;
  q: string;
};

export type ProductFeedPage = {
  items: Product[];
  nextPage: number | null;
  hasMore: boolean;
  total: number;
};

export type ExploreFeedState = {
  filters: ExploreFilters;
  items: Product[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  scrollY: number;
  total: number;
  initialized: boolean;
};

export type SellerProductsData = {
  todaySales: number;
  stats: {
    onSale: number;
    expirySoon: number;
    todayOrders: number;
  };
  products: SellerProduct[];
  pagination: Pagination;
};

export type SellerProductsQuery = {
  page?: number;
  limit?: number;
};
