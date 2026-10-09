import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Included } from "@/components/Included";
import { Journey } from "@/components/Journey";
import { Marquee } from "@/components/Marquee";
import { Problem } from "@/components/Problem";

export default function Home() {
  return (
    <>
      <Header />
      <main className="overflow-x-clip">
        <Hero />
        <Marquee />
        <Problem />
        <HowItWorks />
        <Journey />
        <Included />
      </main>
      <Footer />
    </>
  );
}
