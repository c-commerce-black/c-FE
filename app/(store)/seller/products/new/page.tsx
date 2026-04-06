import { SellerProductForm } from "@/components/seller";
import { requireUser } from "@/lib/auth/server";

export default async function SellerProductNewPage() {
  await requireUser("/seller/products/new");

  return (
    <div className="cc-grid py-5">
      <SellerProductForm mode="create" />
    </div>
  );
}
