"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { Input } from "@/components/shared/ui";
import { getApiErrorMessage, requestApi } from "@/lib/shared/api";
import { LOGO_ALT, PUBLIC_LOGO_PATH } from "@/lib/shared/branding";
import type { User } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.35H12v4.45h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.73Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.73-2.46 1.16-4.07 1.16-3.12 0-5.77-2.1-6.71-4.92H1.29v3.09A12 12 0 0 0 12 24Z"
        fill="#34A853"
      />
      <path
        d="M5.29 14.33A7.2 7.2 0 0 1 4.91 12c0-.81.14-1.6.38-2.33V6.58H1.29A12 12 0 0 0 0 12c0 1.94.46 3.78 1.29 5.42l4-3.09Z"
        fill="#FBBC04"
      />
      <path
        d="M12 4.75c1.76 0 3.34.61 4.58 1.81l3.43-3.43C17.95 1.19 15.23 0 12 0 7.31 0 3.26 2.69 1.29 6.58l4 3.09C6.23 6.85 8.88 4.75 12 4.75Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [pending, startTransition] = useTransition();
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
    startTransition(async () => {
      setError(null);
      const { ok, payload } = await requestApi<{ user: User }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }, "로그인에 실패했습니다.");

      if (!ok || !payload.success) {
        setError(getApiErrorMessage(payload, "로그인에 실패했습니다."));
        return;
      }

      setUser(payload.data.user);
      router.push(next);
      router.refresh();
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
      <div className="flex justify-end text-[13px]">
        <span className="font-semibold text-brand-secondary">비밀번호를 잊으셨나요?</span>
      </div>
      {error ? <p className="text-sm text-urgent">{error}</p> : null}
      <Button type="submit" size="lg" className="mt-3 w-full" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
      </Button>
      <div className="relative py-2 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <span className="relative bg-white px-3 text-[13px] text-text-tertiary">또는</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-3 rounded-[0px] border-[#cfd6e2] text-[18px] font-bold text-[#3f4b5c]"
      >
        <GoogleIcon />
        Google로 계속하기
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
