import { Card } from "./card";

export function PageFallbackNotice({
  message,
}: {
  message: string;
}) {
  return (
    <Card className="border-brand-primary/20 bg-brand-primary-muted/30 p-4">
      <p className="text-[13px] font-semibold text-foreground">{message}</p>
    </Card>
  );
}
