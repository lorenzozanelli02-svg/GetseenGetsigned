import type { Metadata } from "next";
import Link from "next/link";
import { AccessGate } from "@/components/AccessGate";
import { DashboardNav } from "@/components/DashboardNav";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Dashboard · ${SITE.name}`,
  robots: { index: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 sm:h-20">
          <Link href="/" aria-label="Get Seen Get Signed, home">
            <Logo />
          </Link>
          <Link href="/" className="hidden text-sm font-medium text-ink/80 transition-colors hover:text-accent sm:inline">
            Back to site
          </Link>
        </div>
      </header>
      <div className="border-b border-line px-4 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <DashboardNav />
        </div>
      </div>
      <main className="min-h-[60svh] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AccessGate>{children}</AccessGate>
        </div>
      </main>
      <Footer />
    </>
  );
}
