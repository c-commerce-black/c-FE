"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { LOGO_ALT, PUBLIC_LOGO_PATH } from "@/lib/shared/branding";

export function SplashOverlay() {
  const pathname = usePathname();
  const shouldShow = useSyncExternalStore(
    () => () => {},
    () => pathname === "/" && !window.sessionStorage.getItem("cc_splash_seen"),
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = "cc_splash_seen";
    if (!shouldShow) return;
    window.sessionStorage.setItem(key, "1");

    const timer = window.setTimeout(() => setDismissed(true), 3200);
    return () => window.clearTimeout(timer);
  }, [shouldShow]);

  return (
    <AnimatePresence>
      {shouldShow && !dismissed ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.7, 1.06, 1], opacity: 1 }}
              transition={{ duration: 0.7, times: [0, 0.7, 1] }}
              className="flex size-24 items-center justify-center rounded-[2rem] border border-border/70 bg-gradient-to-br from-brand-primary-muted to-brand-accent/30 shadow-[0_20px_60px_rgba(255,105,180,0.22)]"
            >
              <Image
                src={PUBLIC_LOGO_PATH}
                alt={LOGO_ALT}
                width={72}
                height={72}
                priority
                className="h-[72px] w-[72px] object-contain"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl font-black tracking-[-0.04em] text-foreground">
                C-commerce
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                신선한 특가를 더 빠르게
              </p>
            </motion.div>
            <div className="mt-2 flex gap-2">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="cc-dot size-2 rounded-full bg-brand-primary"
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
