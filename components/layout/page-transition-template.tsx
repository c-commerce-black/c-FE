"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransitionTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      className="cc-fade-in"
    >
      {children}
    </motion.div>
  );
}
