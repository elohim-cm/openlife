import type {IconType,} from "react-icons";
import {
  PiHandCoins,
  PiHandshake,
  PiHourglass,
  PiMedal,
} from "react-icons/pi";

export type BenefitLine = {
  text: string;
  highlighted: boolean;
};

export type Benefit = {
  id: string;
  icon: IconType;
  lines: readonly BenefitLine[];
};

export type BenefitDefinition = {
  id: string;
  icon: IconType;
};

export const BENEFIT_DEFINITIONS:
  readonly BenefitDefinition[] = [
    {
      id:"daily-contribution",
      icon:PiHandCoins,
    },
    {
      id:"interest-rate",
      icon:PiMedal,
    },
    {
      id:"withdrawal-period",
      icon:PiHourglass,
    },
    {
      id:"no-fees",
      icon:PiHandshake,
    },
  ] as const;