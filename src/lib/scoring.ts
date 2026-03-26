// src/lib/scoring.ts
// Scoring algorithm for flashcard answers.
// Factors: string similarity, hint penalty, case insensitivity.

/**
 * Score a user's identification attempt against the correct species name.
 *
 * Returns 0-100:
 *   100 = exact match, no hints
 *   80-99 = close match or minor typo, no hints
 *   60-79 = correct with 1 hint
 *   40-59 = correct with 2 hints
 *   20-39 = correct with 3 hints
 *   1-19  = correct with 4 hints
 *   0     = wrong answer or gave up
 */
export function scoreAnswer(
  userAnswer: string,
  correctSpecies: string,
  hintsUsed: number
): { score: number; isCorrect: boolean; matchType: "exact" | "genus" | "close" | "wrong" } {
  const normalizedAnswer = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctSpecies.trim().toLowerCase();

  if (!normalizedAnswer) {
    return { score: 0, isCorrect: false, matchType: "wrong" };
  }

  // Exact match
  if (normalizedAnswer === normalizedCorrect) {
    const hintPenalty = hintsUsed * 20;
    const score = Math.max(5, 100 - hintPenalty);
    return { score, isCorrect: true, matchType: "exact" };
  }

  // Genus-level match (first word correct)
  const correctGenus = normalizedCorrect.split(" ")[0];
  const answerGenus = normalizedAnswer.split(" ")[0];

  // Full species match with minor differences (typos, extra spaces)
  const similarity = stringSimilarity(normalizedAnswer, normalizedCorrect);

  if (similarity >= 0.85) {
    const hintPenalty = hintsUsed * 20;
    const score = Math.max(5, 90 - hintPenalty);
    return { score, isCorrect: true, matchType: "close" };
  }

  // Genus-only match (partial credit)
  if (answerGenus === correctGenus && normalizedAnswer.includes(" ")) {
    const hintPenalty = hintsUsed * 15;
    const score = Math.max(5, 60 - hintPenalty);
    return { score, isCorrect: true, matchType: "genus" };
  }

  // Genus name only (no species epithet)
  if (answerGenus === correctGenus && !normalizedAnswer.includes(" ")) {
    const hintPenalty = hintsUsed * 15;
    const score = Math.max(5, 40 - hintPenalty);
    return { score, isCorrect: true, matchType: "genus" };
  }

  return { score: 0, isCorrect: false, matchType: "wrong" };
}

/**
 * Simple string similarity using Levenshtein distance.
 * Returns 0-1 where 1 is identical.
 */
function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}
