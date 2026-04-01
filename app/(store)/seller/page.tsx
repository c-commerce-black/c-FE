import { SellerDashboardClient } from "@/components/seller";
import { PageFallbackNotice } from "@/components/shared/ui";
import { getSessionToken, requireUser } from "@/lib/auth/server";
import { getSellerProducts } from "@/lib/seller/service";
import { createPageLoadState, type PageLoadState } from "@/lib/shared/types";

async function getSellerPageData(token: string): Promise<{
  data: Awaited<ReturnType<typeof getSellerProducts>>;
  loadState: PageLoadState;
}> {
  try {
    return {
      data: await getSellerProducts(token),
      loadState: createPageLoadState(),
    };
  } catch {
    return {
      data: {
        todaySales: 0,
        stats: {
          onSale: 0,
          expirySoon: 0,
          todayOrders: 0,
        },
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      },
      loadState: createPageLoadState(true),
    };
  }
}

export default async function SellerPage() {
  await requireUser("/seller");
  const token = await getSessionToken();
  const { data, loadState } = await getSellerPageData(token as string);

  return (
    <div className="cc-grid space-y-4 py-5">
      {loadState.isFallback && loadState.message ? (
        <PageFallbackNotice message={loadState.message} />
      ) : null}
      <SellerDashboardClient initialData={data} />
    </div>
  );
}
