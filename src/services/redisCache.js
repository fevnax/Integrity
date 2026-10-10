/**
 * Frontend Redis Cache Service
 *
 * NOTE: Direct Redis access and private credentials have been migrated to the
 * Express backend (/api/cache/*). This eliminates client-side credential exposure
 * (token leak) and prevents fatal bundle crashes (UrlError) in the browser.
 */

/**
 * Check cache for a matching analysis via backend fuzzy-matching endpoint.
 * Gracefully returns null if cache misses or if backend/Redis is unavailable.
 */
export async function checkRedisCache(brand, productName) {
    if (!brand || !productName) return null;

    try {
        const response = await fetch('/api/cache/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                brand: brand.trim(),
                productName: productName.trim(),
            }),
        });

        if (!response.ok) {
            console.warn('[Integrity] Cache check HTTP response status:', response.status);
            return null;
        }

        const data = await response.json();
        if (data?.hit && data?.data) {
            console.log('[Integrity] Cache HIT for:', brand, '-', productName);
            return data.data;
        }

        console.log('[Integrity] Cache MISS for:', brand, '-', productName);
        return null;
    } catch (err) {
        // Never crash the frontend if the cache service is down or unreachable
        console.warn('[Integrity] Cache check unavailable:', err.message);
        return null;
    }
}

/**
 * Store an analysis result in Redis cache via backend endpoint.
 * Fails silently with a warning if saving cannot be completed.
 */
export async function cacheToRedis(brand, productName, analysisData) {
    if (!brand || !productName || !analysisData) return;

    try {
        const response = await fetch('/api/cache/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                brand: brand.trim(),
                productName: productName.trim(),
                analysisData,
            }),
        });

        if (!response.ok) {
            console.warn('[Integrity] Cache save HTTP response status:', response.status);
            return;
        }

        console.log('[Integrity] Successfully cached analysis for:', brand, '-', productName);
    } catch (err) {
        console.warn('[Integrity] Cache save failed:', err.message);
    }
}
