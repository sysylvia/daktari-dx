/**
 * IRT (Item Response Theory) Engine
 * 3-Parameter Logistic model for adaptive case selection and scoring
 * Ported from DiagnosticMastery
 */

export interface ScoringResult {
  rawScore: number;
  abilityEstimate: number;
  standardError: number;
  componentScores: {
    inclusion: number;
    ranking: number;
    notToMiss: number;
    calibration: number;
  };
  feedback: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

interface CaseParams {
  difficulty: number;
  discrimination: number;
  guessing: number;
}

interface DifferentialItem {
  diagnosis: string;
  likelihood?: number;
  reasoning?: string;
}

interface NotToMissItem {
  diagnosis: string;
}

/** Calculate 3PL probability: P(θ) = c + (1-c) / (1 + e^(-a(θ-b))) */
function calculate3PLProbability(
  theta: number,
  difficulty: number,
  discrimination: number,
  guessing: number = 0.15
): number {
  const exponent = -discrimination * (theta - difficulty);
  return guessing + (1 - guessing) / (1 + Math.exp(exponent));
}

/** Calculate Fisher Information for a case at given ability */
function calculateInformation(
  theta: number,
  difficulty: number,
  discrimination: number,
  guessing: number = 0.15
): number {
  const P = calculate3PLProbability(theta, difficulty, discrimination, guessing);
  const Q = 1 - P;
  return (
    Math.pow(discrimination, 2) *
    Math.pow(P - guessing, 2) *
    (Q / P) /
    Math.pow(1 - guessing, 2)
  );
}

/** Maximum Likelihood Estimation for ability (Newton-Raphson) */
function estimateAbility(
  responses: Array<{ score: number } & CaseParams>
): { theta: number; se: number } {
  let theta = 0;
  const maxIterations = 50;
  const convergence = 0.001;

  for (let i = 0; i < maxIterations; i++) {
    let firstDerivative = 0;
    let secondDerivative = 0;

    for (const r of responses) {
      const P = calculate3PLProbability(theta, r.difficulty, r.discrimination, r.guessing);
      const Q = 1 - P;

      firstDerivative += r.discrimination * (r.score - P) * (1 - r.guessing) / (P * Q);
      secondDerivative -=
        Math.pow(r.discrimination, 2) *
        Math.pow(P - r.guessing, 2) *
        (Q / P) /
        Math.pow(1 - r.guessing, 2);
    }

    const thetaNew = theta - firstDerivative / secondDerivative;
    if (Math.abs(thetaNew - theta) < convergence) break;
    theta = thetaNew;
  }

  let totalInformation = 0;
  for (const r of responses) {
    totalInformation += calculateInformation(theta, r.difficulty, r.discrimination, r.guessing);
  }
  const se = totalInformation > 0 ? 1 / Math.sqrt(totalInformation) : 1;

  return { theta, se };
}

/** Select next case using maximum information criterion */
export function selectNextCase(
  availableCases: Array<{ id: string } & CaseParams>,
  completedCaseIds: string[],
  currentAbility: number
): string | null {
  const completed = new Set(completedCaseIds);
  const untaken = availableCases.filter((c) => !completed.has(c.id));
  if (untaken.length === 0) return null;

  const best = untaken.reduce((prev, curr) => {
    const prevInfo = calculateInformation(currentAbility, prev.difficulty, prev.discrimination, prev.guessing);
    const currInfo = calculateInformation(currentAbility, curr.difficulty, curr.discrimination, curr.guessing);
    return currInfo > prevInfo ? curr : prev;
  });

  return best.id;
}

/** Score assessment using 4-component approach */
export function scoreAssessment(
  userDifferential: DifferentialItem[],
  userNotToMiss: (string | NotToMissItem)[],
  confidenceLevel: number,
  caseData: {
    expert_differential: DifferentialItem[];
    not_to_miss: string[];
    difficulty: number;
    discrimination: number;
    guessing: number;
  }
): ScoringResult {
  const expertDiff = caseData.expert_differential;
  const expertNTM = caseData.not_to_miss;

  // Normalize userNotToMiss to strings
  const userNTMStrings = userNotToMiss.map((item) =>
    typeof item === 'string' ? item : item.diagnosis
  );

  // Component 1: Inclusion (40% weight)
  const includedCorrect = userDifferential.filter((d) =>
    expertDiff.some((e) => e.diagnosis === d.diagnosis)
  ).length;
  const includedIncorrect = userDifferential.filter(
    (d) => !expertDiff.some((e) => e.diagnosis === d.diagnosis)
  ).length;
  const inclusionScore = Math.max(
    0,
    (includedCorrect / expertDiff.length) * 10 - includedIncorrect * 0.5
  );

  // Component 2: Ranking (30% weight)
  let rankingScore = 0;
  if (userDifferential.length > 0) {
    const common = userDifferential.filter((d) =>
      expertDiff.some((e) => e.diagnosis === d.diagnosis)
    );
    if (common.length > 0) {
      const diffs = common.map((userDx) => {
        const userRank = userDifferential.findIndex((d) => d.diagnosis === userDx.diagnosis);
        const expertRank = expertDiff.findIndex((e) => e.diagnosis === userDx.diagnosis);
        return Math.abs(userRank - expertRank);
      });
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      rankingScore = Math.max(0, 10 * (1 - avgDiff / expertDiff.length));
    }
  }

  // Component 3: Not-to-Miss (30% weight)
  const ntmCorrect = userNTMStrings.filter((d) => expertNTM.includes(d)).length;
  const ntmMissed = expertNTM.filter((d) => !userNTMStrings.includes(d)).length;
  const ntmScore = Math.max(
    0,
    (ntmCorrect / Math.max(1, expertNTM.length)) * 10 - ntmMissed * 2
  );

  // Component 4: Calibration (bonus)
  const accuracy = (inclusionScore + rankingScore + ntmScore) / 30;
  const calibrationScore = Math.max(
    0,
    5 - Math.abs(accuracy - confidenceLevel / 5) * 5
  );

  const weights = { inclusion: 0.4, ranking: 0.3, notToMiss: 0.3 };
  const rawScore =
    (inclusionScore * weights.inclusion +
      rankingScore * weights.ranking +
      ntmScore * weights.notToMiss) /
    10;

  const componentScores = {
    inclusion: inclusionScore,
    ranking: rankingScore,
    notToMiss: ntmScore,
    calibration: calibrationScore,
  };

  const ability = estimateAbility([
    {
      score: rawScore,
      difficulty: caseData.difficulty,
      discrimination: caseData.discrimination,
      guessing: caseData.guessing || 0.15,
    },
  ]);

  const feedback = generateFeedback(componentScores, rawScore);

  return {
    rawScore: rawScore * 100,
    abilityEstimate: ability.theta,
    standardError: ability.se,
    componentScores,
    feedback,
  };
}

function generateFeedback(
  scores: ScoringResult['componentScores'],
  rawScore: number
) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (scores.inclusion >= 7) strengths.push('Excellent differential diagnosis completeness');
  else if (scores.inclusion < 5) {
    weaknesses.push('Consider including more relevant diagnoses');
    suggestions.push('Review common presentations for this type of case');
  }

  if (scores.ranking >= 7) strengths.push('Good prioritization of differential diagnoses');
  else if (scores.ranking < 5) {
    weaknesses.push('Work on ranking diagnoses by likelihood');
    suggestions.push('Focus on key discriminating features');
  }

  if (scores.notToMiss >= 7) strengths.push('Correctly identified critical diagnoses');
  else if (scores.notToMiss < 5) {
    weaknesses.push('Missed important not-to-miss diagnoses');
    suggestions.push('Review emergency and life-threatening conditions');
  }

  if (scores.calibration >= 3) strengths.push('Good confidence calibration');
  else {
    weaknesses.push('Confidence not well-calibrated with performance');
    suggestions.push('Practice self-assessment and reflection');
  }

  return {
    overallScore: Math.round(rawScore * 100),
    strengths,
    weaknesses,
    suggestions,
  };
}
