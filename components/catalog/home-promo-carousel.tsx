"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Card } from "@/components/shared/ui";

const PROMO_BANNERS = [
  {
    title: "과일 박스 번개 특가",
    copy: "딸기, 청포도, 감귤 조합으로 가볍게 채우는 오늘 장보기.",
    eyebrow: "더미 배너 01",
    badge: "식품",
    href: "/explore?category=FOOD",
    image: "/banners/promo-fruit-market.svg",
    imageAlt: "딸기와 청포도, 오렌지로 구성된 3D 과일 배너",
    accentClass: "from-[#fff6d8] via-[#ffe7eb] to-[#ffd7f1]",
  },
  {
    title: "라면 쟁여두기 좋은 날",
    copy: "매운맛부터 순한맛까지 더미 묶음 배너로 캐러셀 흐름을 채워둡니다.",
    eyebrow: "더미 배너 02",
    badge: "간편식",
    href: "/explore?category=MEAL_KIT",
    image: "/banners/promo-ramen-stack.svg",
    imageAlt: "컵라면과 젓가락이 있는 3D 라면 배너",
    accentClass: "from-[#fff0ca] via-[#ffd7c8] to-[#ffcfe3]",
  },
  {
    title: "상큼 과일 간식전",
    copy: "오렌지, 키위, 블루베리 조합으로 가볍게 넣기 좋은 스낵 느낌.",
    eyebrow: "더미 배너 03",
    badge: "식품",
    href: "/explore?category=FOOD",
    image: "/banners/promo-fruit-snack.svg",
    imageAlt: "오렌지와 키위, 블루베리가 있는 3D 과일 간식 배너",
    accentClass: "from-[#effff6] via-[#e0f7ff] to-[#ffe5f3]",
  },
] as const;

export function HomePromoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const syncButtons = () => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      setCanScrollPrev(track.scrollLeft > 8);
      setCanScrollNext(track.scrollLeft < maxScrollLeft - 8);
    };

    syncButtons();
    track.addEventListener("scroll", syncButtons, { passive: true });
    window.addEventListener("resize", syncButtons);

    return () => {
      track.removeEventListener("scroll", syncButtons);
      window.removeEventListener("resize", syncButtons);
    };
  }, []);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.82, 280),
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-end px-1">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            aria-label="이전 배너 보기"
            disabled={!canScrollPrev}
            onClick={() => scrollByCard(-1)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-[#e6ebf2] bg-white text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="다음 배너 보기"
            disabled={!canScrollNext}
            onClick={() => scrollByCard(1)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-[#e6ebf2] bg-white text-foreground transition disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="cc-scrollbar-hidden -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
      >
        {PROMO_BANNERS.map((banner) => (
          <Card
            key={banner.title}
            className={`min-w-[288px] max-w-[288px] snap-start overflow-hidden border-none bg-gradient-to-br ${banner.accentClass} p-0 shadow-[0_10px_24px_rgba(15,23,42,0.08)]`}
          >
            <Link href={banner.href} className="block p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-text-secondary uppercase">
                    {banner.eyebrow}
                  </p>
                  <h3 className="mt-2 text-[22px] leading-[1.12] font-black tracking-[-0.05em] text-foreground">
                    {banner.title}
                  </h3>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-foreground">
                  {banner.badge}
                </span>
              </div>

              <p className="mt-3 max-w-[220px] text-[13px] leading-5 text-text-secondary">
                {banner.copy}
              </p>

              <div className="relative mt-4 overflow-hidden rounded-[18px] border border-white/60 bg-white/35 p-2 backdrop-blur-sm">
                <Image
                  src={banner.image}
                  alt={banner.imageAlt}
                  width={1536}
                  height={1024}
                  className="h-[172px] w-full rounded-[14px] object-cover"
                  sizes="288px"
                  priority={false}
                />
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-foreground">
                배너 보러 가기
                <ArrowRight className="size-4" />
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
