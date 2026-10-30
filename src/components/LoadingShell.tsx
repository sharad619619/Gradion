export function LoadingShell() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
