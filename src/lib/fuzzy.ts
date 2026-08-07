/**
 * Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

/**
 * Find the most similar string from a list using Levenshtein distance.
 * Returns null if no match meets the threshold (0-1, higher = stricter).
 */
export function fuzzyFindSimilar(
  input: string,
  candidates: string[],
  threshold = 0.7,
): string | null {
  const normalized = input.toLowerCase().trim();
  let best: string | null = null;
  let bestScore = 0;
  for (const c of candidates) {
    const target = c.toLowerCase().trim();
    if (target === normalized) continue; // exact match handled separately
    const dist = levenshtein(normalized, target);
    const maxLen = Math.max(normalized.length, target.length);
    if (maxLen === 0) continue;
    const score = 1 - dist / maxLen;
    if (score >= threshold && score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}
