import { StoreShell } from "@/components/shared/layout";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreShell>{children}</StoreShell>;
}
