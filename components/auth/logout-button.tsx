"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { useAuthStore } from "@/stores/auth-store";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const setUser = useAuthStore((state) => state.setUser);

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          setUser(null);
          router.push("/login");
          router.refresh();
        })
      }
    >
      {pending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
