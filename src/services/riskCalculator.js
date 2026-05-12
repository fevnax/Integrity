import { HARMFUL_INGREDIENTS } from './harmfulIngredients';

const normalizeString = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const buildLookupMap = () => {
  const map = new Map();
  for (const entry of HARMFUL_INGREDIENTS) {
    map.set(normalizeString(entry.name), entry);
    if (entry.altNames) {
      for (const alt of entry.altNames) {
        map.set(normalizeString(alt), entry);
      }
    }
  }
  return map;
};

const LOOKUP_MAP = buildLookupMap();

function findMatch(ingredientName) {
  const normalized = normalizeString(ingredientName);

  const directMatch = LOOKUP_MAP.get(normalized);
  if (directMatch) return directMatch;

  for (const [key, entry] of LOOKUP_MAP) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return entry;
    }
  }

  return null;
}

export function calculateRiskScore(ingredients) {
  if (!ingredients || ingredients.length === 0) {
    return { score: 0, badge: 'green', matchedIngredients: [], unmatchedCount: ingredients?.length || 0 };
  }

  const matchedIngredients = [];
  let unmatchedCount = 0;

  for (const ingredient of ingredients) {
    const searchTerms = [
      ingredient.normalized,
      ingredient.original,
      ingredient.e_number
    ].filter(Boolean);

    let bestMatch = null;
    for (const term of searchTerms) {
      const match = findMatch(term);
      if (match && (!bestMatch || match.score > bestMatch.score)) {
        bestMatch = match;
      }
    }

    if (bestMatch) {
      matchedIngredients.push({
        ingredient: ingredient.original || ingredient.normalized,
        harmfulEntry: bestMatch.name,
        score: bestMatch.score,
        category: bestMatch.category,
        reason: bestMatch.reason
      });
    } else {
      unmatchedCount++;
    }
  }

  // Deduplicate matched ingredients so the same harmful entry doesn't appear multiple times
  const uniqueMap = new Map();
  for (const match of matchedIngredients) {
    if (!uniqueMap.has(match.harmfulEntry)) {
      uniqueMap.set(match.harmfulEntry, match);
    }
  }
  const uniqueMatchedIngredients = Array.from(uniqueMap.values());

  let finalScore = 0;

  if (uniqueMatchedIngredients.length > 0) {
    const sortedScores = uniqueMatchedIngredients
      .map(m => m.score)
      .sort((a, b) => b - a);

    const topScore = sortedScores[0];

    const weightedSum = sortedScores.reduce((sum, s, i) => {
      const weight = 1 / (i + 1);
      return sum + s * weight;
    }, 0);
    const totalWeight = sortedScores.reduce((sum, _, i) => sum + 1 / (i + 1), 0);
    const weightedAvg = weightedSum / totalWeight;

    const densityPenalty = Math.min(15, (uniqueMatchedIngredients.length / ingredients.length) * 30);

    const countPenalty = Math.min(10, uniqueMatchedIngredients.length * 1.5);

    finalScore = Math.round(
      topScore * 0.45 +
      weightedAvg * 0.35 +
      densityPenalty +
      countPenalty
    );
  }

  finalScore = Math.max(0, Math.min(100, finalScore));

  let badge;
  if (finalScore <= 30) badge = 'green';
  else if (finalScore <= 60) badge = 'yellow';
  else badge = 'red';

  return {
    score: finalScore,
    badge,
    matchedIngredients: uniqueMatchedIngredients,
    unmatchedCount
  };
}
