"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { Input } from "@/components/shared/ui";
import { getApiErrorMessage } from "@/lib/shared/api";
import { LOGO_ALT, PUBLIC_LOGO_PATH } from "@/lib/shared/branding";
import { useLoginMutation } from "@/hooks/api";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const next = searchParams.get("next") || "/";

  function updateField(field: "email" | "password", value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    void loginMutation
      .mutateAsync(values)
      .then((data) => {
        setUser(data.user);
        router.push(next);
        router.refresh();
      })
      .catch((loadError) => {
        setError(getApiErrorMessage(loadError, "로그인에 실패했습니다."));
      });
  }

  return (
    <form className="mx-auto max-w-[346px] space-y-5 pt-8" onSubmit={onSubmit}>
      <div className="pt-6 text-center">
        <div className="mx-auto flex size-[88px] items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_top,_rgba(255,105,180,0.16),_transparent_56%),linear-gradient(135deg,_#fff5fb,_#eef8ff)] shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <Image
            src={PUBLIC_LOGO_PATH}
            alt={LOGO_ALT}
            width={64}
            height={64}
            priority
            className="h-16 w-16 object-contain"
          />
        </div>
        <h1 className="mt-4 text-[28px] font-black tracking-[-0.05em] text-foreground">
          C-commerce
        </h1>
        <p className="mt-2 text-[14px] text-text-secondary">
          신선한 특가를 더 빠르게 만나보세요
        </p>
      </div>

      <Input
        label="이메일"
        type="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(event) => updateField("email", event.target.value)}
        autoComplete="email"
      />
      <Input
        label="비밀번호"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={values.password}
        onChange={(event) => updateField("password", event.target.value)}
        autoComplete="current-password"
        rightSlot={
          <button
            type="button"
            className="text-text-tertiary"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      {error ? <p className="text-sm text-urgent">{error}</p> : null}
      <Button
        type="submit"
        size="lg"
        className="mt-3 w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "로그인 중..." : "로그인"}
      </Button>
      <div className="pt-2 text-center text-[14px] text-text-secondary">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-brand-primary">
          회원가입
        </Link>
      </div>
    </form>
  );
}
