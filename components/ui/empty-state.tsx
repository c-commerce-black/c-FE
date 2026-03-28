import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-white/75 px-8 py-14 text-center">
      <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-white transition hover:bg-brand-primary-hover"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
