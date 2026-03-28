import { redirect } from "next/navigation";

import { TermsDetail } from "@/components/auth";
import { TERMS_DATA } from "@/lib/auth";
import type { TermsKey } from "@/lib/auth";

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
