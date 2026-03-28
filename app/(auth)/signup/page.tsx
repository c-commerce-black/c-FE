import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth";
import { getCurrentUser } from "@/lib/auth/server";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return <SignupForm />;
}
