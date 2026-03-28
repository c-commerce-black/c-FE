import { PageTransitionTemplate } from "@/components/shared/layout";

export default function StoreTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransitionTemplate>{children}</PageTransitionTemplate>;
}
