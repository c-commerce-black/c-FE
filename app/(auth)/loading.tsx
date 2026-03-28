export default function AuthLoading() {
  return (
    <div className="cc-shell flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl animate-pulse rounded-[2rem] bg-white/80 p-10 shadow-[var(--cc-shadow-soft)]">
        <div className="h-10 w-48 rounded-full bg-surface-sunken" />
        <div className="mt-6 h-14 rounded-[1.25rem] bg-surface-sunken" />
        <div className="mt-4 h-14 rounded-[1.25rem] bg-surface-sunken" />
        <div className="mt-6 h-14 rounded-full bg-surface-sunken" />
      </div>
    </div>
  );
}
