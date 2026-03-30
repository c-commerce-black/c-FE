"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/shared/ui";
import { Input } from "@/components/shared/ui";
import { getApiErrorMessage, requestApi } from "@/lib/shared/api";
import type { User } from "@/lib/auth";
import { useSignupDraftStore } from "@/stores/signup-draft-store";
import { useAuthStore } from "@/stores/auth-store";

const agreements = [
  { key: "terms", label: "이용약관", required: true },
  { key: "privacy", label: "개인정보 처리방침", required: true },
  { key: "marketing", label: "마케팅 정보 수신", required: false },
] as const;

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    nickname,
    email,
    password,
    passwordConfirm,
    shopName,
    agreements: selectedAgreements,
    setField,
    toggleAgreement,
    toggleAll,
    reset,
  } = useSignupDraftStore();

  const requiredChecked = selectedAgreements.terms && selectedAgreements.privacy;
  const allChecked = useMemo(
    () => Object.values(selectedAgreements).every(Boolean),
    [selectedAgreements],
  );
  const next = searchParams.get("next") || "/";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!requiredChecked) {
      setError("필수 약관에 모두 동의해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const { ok, payload } = await requestApi<{ user: User }>(
        "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname,
            email,
            password,
            shopName: shopName.trim() || undefined,
          }),
        },
        "회원가입에 실패했습니다.",
      );

      if (!ok || !payload.success) {
        setError(getApiErrorMessage(payload, "회원가입에 실패했습니다."));
        return;
      }

      setSuccess("회원가입이 완료되었습니다.");
      setUser(payload.data.user);
      reset();
      router.push(next);
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-primary">
          회원가입
        </p>
        <h1 className="mt-3 text-[clamp(1.2rem,6.4vw,2rem)] leading-[1.2] font-black tracking-[-0.08em] text-foreground">
          <span className="block whitespace-nowrap">계정을 만들고</span>
          <span className="mt-[0.18em] block whitespace-nowrap pl-[1.05em]">
            흐름을 이어가세요
          </span>
        </h1>
        <p className="mt-3 text-base leading-7 text-text-secondary">
          닉네임과 상점명을 설정하고 회원가입을 시작하세요.
        </p>
      </div>

      <Input
        label="닉네임"
        placeholder="사용할 닉네임"
        value={nickname}
        onChange={(event) => setField("nickname", event.target.value)}
      />
      <Input
        label="이메일"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setField("email", event.target.value)}
      />
      <Input
        label="비밀번호"
        type="password"
        placeholder="최소 8자 이상"
        value={password}
        onChange={(event) => setField("password", event.target.value)}
      />
      <Input
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호를 다시 입력"
        value={passwordConfirm}
        onChange={(event) => setField("passwordConfirm", event.target.value)}
      />
      <Input
        label="상점명 (선택)"
        placeholder="예: 신선마켓 한남점"
        value={shopName}
        onChange={(event) => setField("shopName", event.target.value)}
        hint="비워두면 백엔드 기본 규칙에 따라 자동 생성될 수 있습니다."
      />

      <div className="rounded-[1.75rem] border border-border bg-surface p-5">
        <button
          type="button"
          onClick={toggleAll}
          className={`flex w-full items-center justify-between rounded-[1.25rem] px-4 py-4 text-left transition ${
            allChecked ? "bg-brand-primary-muted" : "bg-surface-sunken"
          }`}
        >
          <div>
            <p className="text-base font-bold text-foreground">전체 동의</p>
            <p className="mt-1 text-sm text-text-secondary">
              필수 및 선택 약관을 한 번에 설정합니다.
            </p>
          </div>
          <span
            className={`inline-flex size-6 items-center justify-center rounded-full text-sm font-bold ${
              allChecked
                ? "bg-brand-primary text-white"
                : "border border-border bg-white text-text-secondary"
            }`}
          >
            ✓
          </span>
        </button>
        <div className="mt-4 space-y-2">
          {agreements.map((agreement) => {
            const checked = selectedAgreements[agreement.key];
            return (
              <div
                key={agreement.key}
                className="flex items-center gap-3 rounded-[1.25rem] px-3 py-3 hover:bg-surface-sunken"
              >
                <button
                  type="button"
                  onClick={() => toggleAgreement(agreement.key)}
                  className={`inline-flex size-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                    checked
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-border bg-white text-text-secondary"
                  }`}
                >
                  ✓
                </button>
                <Link
                  href={`/signup/terms/${agreement.key}`}
                  className="flex flex-1 items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {agreement.label}
                    </span>
                    <span className="text-xs font-semibold text-brand-primary">
                      {agreement.required ? "(필수)" : "(선택)"}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-text-tertiary" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm text-urgent">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "가입 중..." : "가입하기"}
      </Button>
      <p className="text-sm text-text-secondary">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-brand-primary">
          로그인
        </Link>
      </p>
    </form>
  );
}
