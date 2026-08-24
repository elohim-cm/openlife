import {
  CalendarClock,
  CirclePercent,
  Coins,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type Benefit = {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  description:
    readonly string[];
};

export type BenefitDefinition = {
  id: string;
  icon: LucideIcon;
};

export const BENEFIT_DEFINITIONS:
  readonly BenefitDefinition[] = [
    {
      id: "daily-contribution",
      icon: Coins,
    },
    {
      id: "no-fees",
      icon: WalletCards,
    },
    {
      id: "withdrawal-period",
      icon: CalendarClock,
    },
    {
      id: "interest-rate",
      icon: CirclePercent,
    },
  ] as const;