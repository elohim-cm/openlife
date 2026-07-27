import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/hero/HeroSection";
import { BenefitsSection } from "@/components/sections/benefits/BenefitsSection";
import { ExperienceSection } from "@/components/sections/experience/ExperienceSection";
import { MobileAppSection } from "@/components/sections/mobile-app/MobileAppSection";
import { NarrativeSection } from "@/components/sections/narrative/NarrativeSection";
import { FaqSection } from "@/components/sections/faq/FaqSection";
import { AssistanceSection } from "@/components/sections/assistance/AssistanceSection";
import { Footer } from "@/components/layout/footer/Footer";


export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSection />
        <BenefitsSection />
        <ExperienceSection />
        <MobileAppSection />
        <NarrativeSection />
        <FaqSection />
        <AssistanceSection />
      </main>

      <Footer />
    </>
  );
}