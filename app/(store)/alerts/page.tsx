import { AlertsClient } from "@/components/alerts";
import { PageFallbackNotice } from "@/components/shared/ui";
import { requireUser, getSessionToken } from "@/lib/auth/server";
import { getAlerts } from "@/lib/alerts/service";
import { createPageLoadState, type PageLoadState } from "@/lib/shared/types";

async function getAlertsPageData(token: string): Promise<{
  data: Awaited<ReturnType<typeof getAlerts>>;
  loadState: PageLoadState;
}> {
  try {
    return {
      data: await getAlerts(token),
      loadState: createPageLoadState(),
    };
  } catch {
    return {
      data: {
        wishAlerts: [],
        todayDeals: [],
      },
      loadState: createPageLoadState(true),
    };
  }
}

export default async function AlertsPage() {
  await requireUser("/alerts");
  const token = await getSessionToken();
  const { data, loadState } = await getAlertsPageData(token as string);

  return (
    <div className="cc-grid space-y-6 py-5">
      <div>
        <h1 className="text-[22px] font-black tracking-[-0.05em] text-foreground">
          알림
        </h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          놓치기 쉬운 특가를 바로 확인하세요
        </p>
      </div>
      {loadState.isFallback && loadState.message ? (
        <PageFallbackNotice message={loadState.message} />
      ) : null}
      <AlertsClient
        initialWishAlerts={data.wishAlerts}
        initialTodayDeals={data.todayDeals}
      />
    </div>
  );
}
