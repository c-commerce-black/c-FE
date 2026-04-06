import { ExplorePageClient } from "@/components/catalog";

type SearchParams = Promise<{
  category?: string;
  sort?: string;
  q?: string;
}>;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category = "", sort = "expiry_asc", q = "" } = await searchParams;
  return <ExplorePageClient category={category} sort={sort} q={q} />;
}
