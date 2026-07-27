export type FaqItem = {
  id: string;
  number: number;
  question: string;
  answer: string;
  details?: readonly string[];
};

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "how-it-works",
    number: 1,
    question: "COMMENT ÇA MARCHE ?",
    answer: "Téléchargez l’application Open Life ou appelez un conseiller au (+237) 658 994 705 pour l’ouverture de votre compte. Une fois votre compte ouvert, un code pour la consultation et le paiement de vos primes vous sera attribué. Vous êtes alors client Open Life et pouvez cotiser vos primes quotidiennement afin de préparer vos projets en toute sérénité.",
  },
  {
    id: "contract-guarantee",
    number: 2,
    question: "QUE GARANTIT LE CONTRAT ?",
    answer: "Le contrat Open Life vous permet de vous constituer un capital épargne jour après jour pour la réalisation de vos projets à moyen et long terme. Le total des primes versées est revalorisé à 2 % par an. En cas de décès ou d’invalidité totale et définitive, un capital égal au cumul des versements revalorisés sera versé au bénéficiaire désigné.",
  },
  {
    id: "contract-duration",
    number: 3,
    question: "QUELLE EST LA DATE D’EFFET DU CONTRAT ET SA DURÉE ?",
    answer: "Le contrat prend effet après le paiement de la première prime. La date d’effet est précisée dans les conditions particulières du contrat. La durée est celle décidée lors de la signature de la proposition. La durée minimale conseillée est de 2 ans et la durée maximale de 15 ans. Le contrat prévoit une tacite reconduction annuelle à l’échéance.",
  },
  {
    id: "early-withdrawal",
    number: 4,
    question: "À PARTIR DE QUAND ET COMMENT EST-IL POSSIBLE D’UTILISER L’ÉPARGNE CONSTITUÉE AVANT LA FIN DU CONTRAT ?",
    answer: "À partir de la fin du sixième mois du contrat, vous pouvez demander, via l’application ou en utilisant le code USSD, le retrait d’une partie ou de la totalité de l’épargne constituée. Seul le rachat total met fin au contrat. Aucun frais de rachat n’est appliqué.",
  },
  {
    id: "payment-delay",
    number: 5,
    question: "QUEL EST LE DÉLAI DE PAIEMENT DE L’ÉPARGNE ?",
    answer: "Le paiement de l’épargne revalorisée est effectué sous 48 heures, par transfert direct vers votre compte Orange Money ou MTN Mobile Money, selon votre préférence. Le même délai est observé pour le paiement de la valeur de rachat.",
  },
  {
    id: "contract-funding",
    number: 6,
    question: "COMMENT EST ALIMENTÉ VOTRE CONTRAT ?",
    answer: "Le contrat est alimenté par des versements journaliers à partir de 200 FCFA. Le plafond mensuel est fixé à 1 000 000 FCFA. Il est possible d’effectuer des versements libres et complémentaires à tout moment, même plusieurs fois dans la journée.",
  },
  {
    id: "contract-fees",
    number: 7,
    question: "QUELS SONT LES CHARGEMENTS À PRÉVOIR SUR LE CONTRAT ?",
    answer: "Tous les chargements appliqués au contrat sont nuls :",
    details: [
      "Frais sur les versements : 0 %",
      "Frais sur les rachats partiels : 0 %",
      "Frais sur les rachats totaux : 0 %",
    ],
  },
] as const;