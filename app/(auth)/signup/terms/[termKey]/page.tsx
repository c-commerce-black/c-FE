import { redirect } from "next/navigation";

import { TermsDetail } from "@/components/commerce/terms-detail";
import { TERMS_DATA } from "@/lib/constants";
import type { TermsKey } from "@/lib/types";

type Params = Promise<{ termKey: TermsKey }>;

export default async function TermsPage({
  params,
}: {
  params: Params;
}) {
  const { termKey } = await params;
  if (!(termKey in TERMS_DATA)) {
    redirect("/signup");
  }

  return <TermsDetail termKey={termKey} />;
}
