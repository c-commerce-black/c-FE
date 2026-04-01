export const PAGE_FALLBACK_MESSAGE =
  "일부 정보를 최신 상태로 불러오지 못했어요. 잠시 후 다시 확인해 주세요.";

export type PageLoadState = {
  isFallback: boolean;
  message?: string;
};

export function createPageLoadState(isFallback = false): PageLoadState {
  return isFallback
    ? { isFallback: true, message: PAGE_FALLBACK_MESSAGE }
    : { isFallback: false };
}
