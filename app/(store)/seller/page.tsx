import { SellerDashboardClient } from "@/components/commerce/seller-dashboard-client";
import { requireSeller, getSessionToken } from "@/lib/auth";
import { getSellerProducts } from "@/lib/commerce";

export default async function SellerPage() {
  await requireSeller("/seller");
  const token = await getSessionToken();
  const data = await getSellerProducts(token as string);

  return (
    <div className="cc-grid py-5">
      <SellerDashboardClient initialData={data} />
    </div>
  );
}
