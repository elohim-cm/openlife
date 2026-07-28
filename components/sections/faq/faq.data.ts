export type FaqItem = {
  id: string;
  number: number;
  question: string;
  answer: string;
  details?: readonly string[];
};
