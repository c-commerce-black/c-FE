export type Role = "BUYER" | "SELLER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  shopName?: string | null;
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
