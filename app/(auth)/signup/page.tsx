import { redirect } from "next/navigation";

import { SignupForm } from "@/components/commerce/signup-form";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return <SignupForm />;
}
