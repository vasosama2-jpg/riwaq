import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-primary">٤٠٤</p>
      <h1 className="font-display text-4xl">هالصفحة مش موجودة</h1>
      <p className="text-muted">يمكن الرابط انكسر، أو القطعة انشالت من الرف.</p>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-bg transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        ارجع للمعرض
      </Link>
    </main>
  );
}
