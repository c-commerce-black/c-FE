import { PageTransitionTemplate } from "@/components/shared/layout";

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransitionTemplate>{children}</PageTransitionTemplate>;
}
