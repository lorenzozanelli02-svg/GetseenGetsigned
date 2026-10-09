import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Logo textClass="text-lg sm:text-xl" markSize={32} />
        <p className="text-sm text-muted">&copy; {new Date().getFullYear()} Get Seen Get Signed</p>
      </div>
    </footer>
  );
}
