"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TERMS_DATA } from "@/lib/constants";
import type { TermsKey } from "@/lib/types";
import { useSignupDraftStore } from "@/stores/signup-draft-store";

export function TermsDetail({ termKey }: { termKey: TermsKey }) {
  const router = useRouter();
  const document = TERMS_DATA[termKey];
  const agreed = useSignupDraftStore((state) => state.agreements[termKey]);
  const toggleAgreement = useSignupDraftStore((state) => state.toggleAgreement);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge tone={document.badge === "필수" ? "pink" : "neutral"}>
          {document.badge}
        </Badge>
        <p className="text-sm text-text-secondary">
          최종 수정일 {document.lastUpdated}
        </p>
      </div>
      <div>
        <h1 className="text-4xl font-black tracking-[-0.06em] text-foreground">
          {document.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-text-secondary">
          회원가입 흐름에서 바로 복귀할 수 있도록 상태는 전역 초안 스토어에
          유지됩니다.
        </p>
      </div>
      <div className="space-y-6 rounded-[1.75rem] border border-border bg-surface p-6">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-bold tracking-[-0.03em] text-foreground">
              {section.heading}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <div className="flex gap-3">
        <Button
          variant={agreed ? "outline" : "primary"}
          size="lg"
          className="flex-1"
          onClick={() => {
            toggleAgreement(termKey);
            router.push("/signup");
          }}
        >
          {agreed ? "동의 취소" : "동의하기"}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => router.push("/signup")}>
          돌아가기
        </Button>
      </div>
    </div>
  );
}
