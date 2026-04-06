import Link from "next/link";

import { SellerProductForm } from "@/components/seller";
import { Card, PageFallbackNotice } from "@/components/shared/ui";
import { getSessionToken, requireUser } from "@/lib/auth/server";
import { getSellerProduct } from "@/lib/seller/service";
import { createPageLoadState, type PageLoadState } from "@/lib/shared/types";

type Params = Promise<{ id: string }>;

async function getSellerProductPageData(
  token: string,
  id: string,
): Promise<{
  product: Awaited<ReturnType<typeof getSellerProduct>>;
  loadState: PageLoadState;
}> {
  try {
    return {
      product: await getSellerProduct(token, id),
      loadState: createPageLoadState(),
    };
  } catch {
    return {
      product: null,
      loadState: createPageLoadState(true),
    };
  }
}

export default async function SellerProductEditPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  await requireUser(`/seller/products/${id}/edit`);
  const token = await getSessionToken();
  const { product, loadState } = await getSellerProductPageData(token as string, id);

  if (!product) {
    return (
      <div className="cc-grid space-y-4 py-5">
        {loadState.isFallback && loadState.message ? (
          <PageFallbackNotice message={loadState.message} />
        ) : null}
        <Card className="space-y-4 p-5">
          <h1 className="text-[22px] font-black tracking-[-0.05em] text-foreground">
            수정할 상품을 찾지 못했습니다
          </h1>
          <p className="text-[14px] leading-6 text-text-secondary">
            상품이 삭제되었거나 셀러 목록을 불러오지 못했습니다.
          </p>
          <Link
            href="/seller"
            className="inline-flex h-12 items-center justify-center rounded-[16px] bg-brand-primary px-5 text-[15px] font-semibold text-white"
          >
            셀러 허브로 돌아가기
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="cc-grid space-y-4 py-5">
      {loadState.isFallback && loadState.message ? (
        <PageFallbackNotice message={loadState.message} />
      ) : null}
      <SellerProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          name: product.name,
          description: product.description ?? "",
          category: product.category ?? "FOOD",
          originalPrice: String(product.originalPrice ?? product.currentPrice),
          stock: String(product.stock),
          expiryDate: product.expiryDate?.slice(0, 10) ?? "",
          imageUrl: product.imageUrl ?? "",
        }}
      />
    </div>
  );
}
