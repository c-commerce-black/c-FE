import { AlertsClient } from "@/components/alerts";
import { requireUser, getSessionToken } from "@/lib/auth/server";
import { getAlerts } from "@/lib/alerts";

export default async function AlertsPage() {
  await requireUser("/alerts");
  const token = await getSessionToken();
  const data = await getAlerts(token as string);

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
      <AlertsClient
        initialWishAlerts={data.wishAlerts}
        initialTodayDeals={data.todayDeals}
      />
    </div>
  );
}
