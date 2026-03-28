"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, MessageSquare, UserRound, Users } from "lucide-react";

import { cn } from "@/lib/shared/utils";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/explore", label: "네트워크", icon: Users },
  { href: "/seller", label: "개발 Q&A", icon: MessageSquare },
  { href: "/alerts", label: "알림", icon: Bell },
  { href: "/account", label: "내 프로필", icon: UserRound },
] as const;

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="cc-shell flex min-h-screen justify-center">
      <div className="cc-app-frame relative">
        <main className="overflow-x-hidden px-4 pt-5 pb-24">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-transparent">
          <div className="cc-app-frame !min-h-0 rounded-none border-x-0 border-b-0 border-t border-[#e9edf4] bg-white px-4 py-2 shadow-none md:rounded-b-[44px]">
            <div className="flex items-center justify-between">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-1 py-1.5 text-[10px] font-medium"
                  >
                    {active ? (
                      <span className="absolute -top-2 h-[3px] w-6 rounded-full bg-brand-primary" />
                    ) : null}
                    <span
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full transition",
                        active ? "text-brand-primary" : "text-[#97a3b6]",
                      )}
                    >
                      <Icon className="size-[1.1rem]" strokeWidth={1.85} />
                    </span>
                    <span className={active ? "font-semibold text-brand-primary" : "text-[#97a3b6]"}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
