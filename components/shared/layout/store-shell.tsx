"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Home,
  MessageSquare,
  ShoppingCart,
  UserRound,
  Users,
} from "lucide-react";

import { useAlertsNotificationQuery } from "@/hooks/api";
import { createAlertSignalKey } from "@/lib/alerts/notification";
import { cn } from "@/lib/shared/utils";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/explore", label: "네트워크", icon: Users },
  { href: "/cart", label: "장바구니", icon: ShoppingCart },
  { href: "/seller", label: "셀러", icon: MessageSquare },
  { href: "/alerts", label: "알림", icon: Bell },
  { href: "/account", label: "내 프로필", icon: UserRound },
] as const;
const ALERT_SEEN_STORAGE_PREFIX = "cc_seen_alert_signal";

function getAlertSeenStorageKey(userId: string | undefined) {
  return userId ? `${ALERT_SEEN_STORAGE_PREFIX}:${userId}` : null;
}

function readSeenAlertSignal(storageKey: string | null) {
  if (!storageKey || typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeSeenAlertSignal(storageKey: string | null, signalKey: string | null) {
  if (!storageKey || !signalKey || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, signalKey);
  } catch {
    // Ignore storage failures so navigation remains usable in private contexts.
  }
}

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const storageKey = getAlertSeenStorageKey(user?.id);
  const isAlertsPath = pathname.startsWith("/alerts");
  const alertsQuery = useAlertsNotificationQuery({
    enabled: Boolean(user),
  });
  const alertSignalKey = createAlertSignalKey(alertsQuery.data);
  const seenAlertSignalKey = readSeenAlertSignal(storageKey);
  const hasNewAlertSignal = Boolean(
    user &&
      alertSignalKey &&
      alertSignalKey !== seenAlertSignalKey &&
      !isAlertsPath,
  );

  useEffect(() => {
    if (isAlertsPath) {
      writeSeenAlertSignal(storageKey, alertSignalKey);
    }
  }, [alertSignalKey, isAlertsPath, storageKey]);

  return (
    <div className="cc-shell flex min-h-screen justify-center">
      <div className="cc-app-frame relative">
        <main className="overflow-x-hidden px-4 pt-5 pb-24">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-transparent">
          <div className="cc-app-frame !min-h-0 rounded-none border-x-0 border-b-0 border-t border-[#e9edf4] bg-white px-4 py-2 shadow-none md:rounded-b-[44px]">
            <div className="flex items-center justify-between">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === href : pathname.startsWith(href);
                const showAlertDot = href === "/alerts" && hasNewAlertSignal;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={showAlertDot ? `${label}, 새 알림 있음` : label}
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
                      {showAlertDot ? (
                        <span className="cc-dot absolute right-2 top-1 size-2.5 rounded-full border-2 border-white bg-urgent">
                          <span className="sr-only">새 알림</span>
                        </span>
                      ) : null}
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
