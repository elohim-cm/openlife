export const MINIMUM_DAILY_PREMIUM = 200;

export const ANNUAL_INTEREST_RATE = 0.02;

const DAYS_PER_YEAR = 365;

const FIRST_YEAR_REVALUATION_FACTOR = 368_903 / 365_000;

export type SimulationRow = {
  id: number;
  date: Date;
  contribution: number;
  surrenderValue: number;
  rate: number;
};

export type SimulationResult = {
  totalContribution: number;
  terminalSurrenderValue: number;
  rows: readonly SimulationRow[];
};

export function calculateSimulation(
  dailyPremium: number,
  durationInYears: number,
  startDate = new Date(),
): SimulationResult {
  const annualContribution =
    dailyPremium * DAYS_PER_YEAR;

  const firstYearSurrenderValue =
    annualContribution *
    FIRST_YEAR_REVALUATION_FACTOR;

  let currentSurrenderValue = 0;

  const rows = Array.from(
    {
      length: durationInYears,
    },
    (_, index): SimulationRow => {
      const year = index + 1;

      currentSurrenderValue =
        currentSurrenderValue *
          (1 +
            ANNUAL_INTEREST_RATE) +
        firstYearSurrenderValue;

      const maturityDate =
        new Date(startDate);

      maturityDate.setFullYear(
        startDate.getFullYear() +
          year,
      );

      return {
        id: year,
        date: maturityDate,
        contribution:
          annualContribution *
          year,
        surrenderValue:
          currentSurrenderValue,
        rate:
          ANNUAL_INTEREST_RATE *
          100,
      };
    },
  );

  return {
    totalContribution:
      annualContribution *
      durationInYears,

    terminalSurrenderValue:
      currentSurrenderValue,

    rows,
  };
}