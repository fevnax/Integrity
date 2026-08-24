import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: import.meta.env.VITE_UPSTASH_REDIS_URL,
    token: import.meta.env.VITE_UPSTASH_REDIS_TOKEN,
});

const CACHE_HASH = 'integrity:cache';

// --- String utilities (migrated from analysisStorage.js) ---

function generateCacheKey(brand, product) {
    const raw = `${(brand || '').trim().toLowerCase()}|${(product || '').trim().toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `cache_${Math.abs(hash).toString(36)}`;
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

function stringSimilarity(a, b) {
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
}

// --- Public API ---

/**
 * Check Redis cache for a matching analysis using Levenshtein fuzzy matching.
 * Fetches all entries from the cache hash and runs similarity checks client-side.
 */
export async function checkRedisCache(brand, productName) {
    if (!brand || !productName) return null;

    const normBrand = brand.trim().toLowerCase();
    const normProduct = productName.trim().toLowerCase();

    try {
        const allEntries = await redis.hgetall(CACHE_HASH);

        if (!allEntries || Object.keys(allEntries).length === 0) {
            console.log('[Integrity] Redis cache empty - MISS');
            return null;
        }

        let bestMatch = null;
        let bestScore = 0;

        for (const [, entry] of Object.entries(allEntries)) {
            // Upstash auto-deserializes JSON values
            const data = typeof entry === 'string' ? JSON.parse(entry) : entry;

            const brandSim = stringSimilarity(normBrand, data.brand_lower || '');
            const productSim = stringSimilarity(normProduct, data.product_name_lower || '');

            if (brandSim < 0.7) continue;

            let score = brandSim * 0.3 + productSim * 0.7;

            if (productSim >= 0.9 && brandSim >= 0.8) {
                console.log(`[Integrity] Redis cache HIT (strong: brand=${(brandSim * 100).toFixed(0)}% product=${(productSim * 100).toFixed(0)}%) for: ${brand} - ${productName}`);
                return data.analysisData;
            }

            if (productSim >= 0.75 && data.ingredient_names?.length) {
                score += 0.1;
            }

            if (score > bestScore && score >= 0.7) {
                bestScore = score;
                bestMatch = data;
            }
        }

        if (bestMatch) {
            console.log(`[Integrity] Redis cache HIT (fuzzy: score=${(bestScore * 100).toFixed(0)}%) for: ${brand} - ${productName}`);
            return bestMatch.analysisData;
        }

        console.log('[Integrity] Redis cache MISS for:', brand, '-', productName);
        return null;
    } catch (err) {
        console.warn('[Integrity] Redis cache check failed:', err.message);
        return null;
    }
}

/**
 * Store an analysis result in Redis cache.
 * Uses HSET on the cache hash with a deterministic key.
 */
export async function cacheToRedis(brand, productName, analysisData) {
    if (!brand || !productName) return;

    try {
        const cacheKey = generateCacheKey(brand, productName);
        const cleanData = { ...analysisData };
        delete cleanData.imagePreview;
        delete cleanData.matched_harmful;

        const ingredientNames = (analysisData.ingredients || [])
            .map(i => i.normalized || i.original)
            .filter(Boolean);

        const entry = {
            brand_lower: brand.trim().toLowerCase(),
            product_name_lower: productName.trim().toLowerCase(),
            ingredient_names: ingredientNames,
            analysisData: cleanData,
            cachedAt: new Date().toISOString()
        };

        await redis.hset(CACHE_HASH, { [cacheKey]: entry });
        console.log('[Integrity] Redis cached analysis for:', brand, '-', productName);
    } catch (err) {
        console.warn('[Integrity] Redis cache save failed:', err.message);
    }
}
