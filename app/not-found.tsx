import Link from "next/link";

export default function NotFound() {
  return (
    <main className="cc-shell flex min-h-screen items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg rounded-[2rem] border border-border bg-surface p-10 text-center shadow-[var(--cc-shadow-soft)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-primary">
          404
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-foreground">
          찾으시는 페이지가 없습니다
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          주소를 다시 확인하거나 홈에서 다시 탐색을 시작해 주세요.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
          >
            홈으로 이동
          </Link>
          <Link
            href="/explore"
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-sunken"
          >
            상품 둘러보기
          </Link>
        </div>
      </div>
    </main>
  );
}
