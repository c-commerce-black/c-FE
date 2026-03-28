import { SellerProductForm } from "@/components/seller";
import { requireSeller } from "@/lib/auth/server";

export default async function SellerProductNewPage() {
  await requireSeller("/seller/products/new");

  return (
    <div className="cc-grid py-5">
      <SellerProductForm />
    </div>
  );
}
