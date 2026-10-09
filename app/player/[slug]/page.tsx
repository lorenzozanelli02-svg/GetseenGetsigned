import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { PublicProfile } from "@/components/PublicProfile";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

/** The player's name is in the link (jamie-walker-<id>), so the tab title can show it without loading the profile. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.split("-").slice(0, -1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { title: name ? `${name} · Football profile` : `Player profile · ${SITE.name}` };
}

/** Public player page. No access needed. */
export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <header className="border-b border-line px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-3xl items-center sm:h-20">
          <Link href="/" aria-label="Get Seen Get Signed, home">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="min-h-[60svh] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <PublicProfile slug={slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
