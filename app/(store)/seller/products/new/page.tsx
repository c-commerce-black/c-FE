import { SellerProductForm } from "@/components/commerce/seller-product-form";
import { requireSeller } from "@/lib/auth";

export default async function SellerProductNewPage() {
  await requireSeller("/seller/products/new");

  return (
    <div className="cc-grid py-5">
      <SellerProductForm />
    </div>
  );
}
