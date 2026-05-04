/** Bonus benefit rolls awarded by highest rank reached (page 46). */
export type RankBenefitRow = {
  highestRankAtLeast: number;
  highestRankAtMost: number;
  bonusBenefitRolls: number;
  /** DM applied to ALL benefit rolls from this career when reached. */
  benefitRollDM?: number;
};

export const RANK_BENEFITS: RankBenefitRow[] = [
  { highestRankAtLeast: 1, highestRankAtMost: 2, bonusBenefitRolls: 1 },
  { highestRankAtLeast: 3, highestRankAtMost: 4, bonusBenefitRolls: 2 },
  { highestRankAtLeast: 5, highestRankAtMost: 6, bonusBenefitRolls: 3, benefitRollDM: 1 },
];

export function rankBenefits(highestRank: number): RankBenefitRow | undefined {
  return RANK_BENEFITS.find(
    (row) => highestRank >= row.highestRankAtLeast && highestRank <= row.highestRankAtMost,
  );
}

/** Cap on cash benefit rolls across ALL careers. */
export const MAX_CASH_BENEFIT_ROLLS_TOTAL = 3;
