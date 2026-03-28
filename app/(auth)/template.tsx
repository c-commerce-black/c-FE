import { PageTransitionTemplate } from "@/components/layout/page-transition-template";

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransitionTemplate>{children}</PageTransitionTemplate>;
}
