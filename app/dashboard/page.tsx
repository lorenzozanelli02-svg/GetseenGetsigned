import type { Metadata } from "next";
import Link from "next/link";
import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Dashboard · ${SITE.name}`,
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <>
      <header className="border-b border-line px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 sm:h-20">
          <Link href="/" aria-label="Get Seen Get Signed, home">
            <Logo />
          </Link>
          <Link href="/" className="text-sm font-medium text-ink/80 transition-colors hover:text-accent">
            Back to site
          </Link>
        </div>
      </header>
      <main className="min-h-[60svh] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Dashboard />
        </div>
      </main>
      <Footer />
    </>
  );
}
