import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import { ProductDetailPageClient } from "@/components/catalog";
import { CATEGORY_LABELS } from "@/lib/catalog";
import { normalizeProductDetailData } from "@/lib/catalog/service";
import { resolveApiResponseFromAxios } from "@/lib/shared/api";
import { backendApi } from "@/lib/shared/api/backend";
import { formatCurrency } from "@/lib/shared/utils";

const getProduct = cache(async (id: string) => {
  const response = await backendApi.get(`/api/products/${id}`, {
    validateStatus: () => true,
  });
  const { payload } = resolveApiResponseFromAxios<unknown>(
    response,
    "상품 정보를 불러오지 못했습니다.",
  );

  if (!payload.success) {
    return {
      status: response.status,
      data: null,
    };
  }

  return {
    status: response.status,
    data: normalizeProductDetailData(payload.data),
  };
});

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const productResponse = await getProduct(id);
  if (!productResponse.data?.product) {
    return {
      title: "상품을 찾을 수 없습니다",
    };
  }

  const product = productResponse.data.product;

  return {
    title: product.name,
    description: `${CATEGORY_LABELS[product.category]} · ${formatCurrency(
      product.currentPrice,
    )} · D-${product.dDay} 특가 상품`,
    openGraph: {
      title: product.name,
      description: `${product.discountRate}% 할인 · ${formatCurrency(
        product.currentPrice,
      )}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const productResponse = await getProduct(id);

  if (productResponse.status === 404) {
    notFound();
  }

  return <ProductDetailPageClient productId={id} />;
}
