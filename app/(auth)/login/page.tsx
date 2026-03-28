import { redirect } from "next/navigation";

import { LoginForm } from "@/components/commerce/login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return <LoginForm />;
}
