import { PageTransitionTemplate } from "@/components/layout/page-transition-template";

export default function StoreTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransitionTemplate>{children}</PageTransitionTemplate>;
}
