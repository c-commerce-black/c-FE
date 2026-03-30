import { SellerDashboardClient } from "@/components/seller";
import { getSessionToken, requireUser } from "@/lib/auth/server";
import { getSellerProducts } from "@/lib/seller";

export default async function SellerPage() {
  await requireUser("/seller");
  const token = await getSessionToken();
  const data = await getSellerProducts(token as string);

  return (
    <div className="cc-grid py-5">
      <SellerDashboardClient initialData={data} />
    </div>
  );
}
