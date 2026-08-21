import type {
  Metadata,
} from "next";


import {
  SimulationPageContent,
} from "@/components/pages/simulation/SimulationPageContent";

export const metadata:
  Metadata = {
    title:
      "Simulateur d’épargne | Open Life",

    description:
      "Simulez votre épargne journalière Open Life et consultez l’évolution annuelle de votre capital et de sa valeur de rachat.",
  };

export default function SimulationPage() {
  return (
    <SimulationPageContent />
  );
}