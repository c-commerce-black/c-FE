export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cc-shell flex min-h-screen justify-center">
      <div className="cc-app-frame">
        <section className="px-4 pt-5 pb-8">{children}</section>
      </div>
    </div>
  );
}
