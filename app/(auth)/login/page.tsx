import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth";
import { getCurrentUser } from "@/lib/auth/server";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return <LoginForm />;
}
