export default function StoreLoading() {
  return (
    <div className="cc-grid py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-12 w-48 rounded-full bg-surface-sunken" />
        <div className="h-72 rounded-[2.5rem] bg-surface-sunken" />
        <div className="grid gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 rounded-[2rem] bg-surface-sunken" />
          ))}
        </div>
      </div>
    </div>
  );
}
