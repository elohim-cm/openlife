import type {
  Metadata,
} from "next";

import {
  Footer,
} from "@/components/layout/footer/Footer";
import {
  Header,
} from "@/components/layout/Header";
import {
  FaqPageSection,
} from "@/components/pages/faq/FaqPageSection";

export const metadata:
  Metadata = {
    title:
      "Questions fréquentes | Open Life",

    description:
      "Retrouvez les réponses aux questions fréquentes sur l’épargne journalière Open Life, les versements, les rachats et la durée du contrat.",
  };

export default function FaqPage() {
  return (
    <>
      <Header />

      <main>
        <FaqPageSection />
      </main>

      <Footer />
    </>
  );
}