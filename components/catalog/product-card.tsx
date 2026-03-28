"use client";

import Link from "next/link";

import { Card } from "@/components/shared/ui";
import type { Product } from "@/lib/catalog";
import { cn, formatCurrency } from "@/lib/shared/utils";

function placeholderTone(category: Product["category"]) {
  if (category === "FOOD") return "bg-[#eefdf3] text-[#9ee8b2]";
  if (category === "BEAUTY") return "bg-[#fff1f8] text-[#f7b5d9]";
  if (category === "DRINK") return "bg-[#ebfbff] text-[#7ce9f5]";
  return "bg-[#f3f6fb] text-[#c7d0de]";
}

export function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "home";
}) {
  const home = variant === "home";

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <Card
        className={cn(
          "overflow-hidden p-4 transition duration-200",
          home
            ? "rounded-[16px] border-[#edf1f6] shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
            : "group-hover:-translate-y-0.5",
        )}
      >
        <div className="flex gap-4">
          <div
            className={cn(
              "relative flex shrink-0 items-center justify-center rounded-[16px]",
              home ? "h-[76px] w-[76px]" : "h-20 w-20",
              placeholderTone(product.category),
            )}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="size-8 rounded-full bg-current opacity-75" />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3
              className={cn(
                "line-clamp-2 font-black tracking-[-0.04em] text-foreground",
                home ? "text-[16px] leading-[1.28]" : "text-[17px] leading-[1.3]",
              )}
            >
              {product.name}
            </h3>
            <div className="mt-2 flex items-end gap-2">
              <span
                className={cn(
                  "leading-none font-black tracking-[-0.04em] text-brand-primary",
                  home ? "text-[18px]" : "text-[17px]",
                )}
              >
                {formatCurrency(product.currentPrice)}
              </span>
              <span className="text-[12px] text-[#afb7c5] line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full bg-[#fff1f1] font-bold text-[#ff5e6b]",
                  home ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-[12px]",
                )}
              >
                D-{product.dDay}
              </span>
              <span
                className={cn(
                  "rounded-full bg-[#fff7e9] font-bold text-[#ffb11f]",
                  home ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-[12px]",
                )}
              >
                -{product.discountRate}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
