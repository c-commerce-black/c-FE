"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { SORT_OPTIONS } from "@/lib/catalog";
import { buildQueryString, cn } from "@/lib/shared/utils";

export function ExploreSortDropdown({
  category,
  sort,
  q,
}: {
  category: string;
  sort: string;
  q: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const currentOption = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0],
    [sort],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextSort: string) => {
    setOpen(false);
    router.push(
      `/explore${buildQueryString({
        category,
        sort: nextSort,
        q,
      })}`,
    );
  };

  return (
    <div ref={rootRef} className="relative pb-1">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="정렬 선택"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 text-[15px] font-semibold text-foreground"
      >
        {currentOption.label}
        <ChevronDown
          className={cn("size-4 transition", open ? "rotate-180" : "rotate-0")}
          strokeWidth={2.3}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[168px] rounded-[16px] border border-[#e7ecf3] bg-white p-2 shadow-[0_14px_28px_rgba(15,23,42,0.10)]"
        >
          {SORT_OPTIONS.map((option) => {
            const active = option.value === currentOption.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-[14px] font-semibold transition",
                  active
                    ? "bg-[#fff2f8] text-brand-primary"
                    : "text-foreground hover:bg-[#f7f9fc]",
                )}
              >
                <span>{option.label}</span>
                {active ? <Check className="size-4" strokeWidth={2.4} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
