export type User = {
  id: string;
  email: string;
  nickname: string;
  sellerProfileId: string;
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
