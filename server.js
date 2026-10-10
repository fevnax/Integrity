import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { Redis } from '@upstash/redis';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Load local .env file if available and variables are not already set
const envPath = join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        for (const line of envContent.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const idx = trimmed.indexOf('=');
                const key = trimmed.slice(0, idx).trim();
                const val = trimmed.slice(idx + 1).trim();
                if (key && !process.env[key]) {
                    process.env[key] = val;
                }
            }
        }
    } catch (e) {
        console.warn('[Integrity Server] Failed to read .env file:', e.message);
    }
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// --- Upstash Redis Setup ---
const CACHE_HASH = 'integrity:cache';
let redisClient = null;
let redisInitialized = false;

function getRedisCredentials() {
    let url = process.env.UPSTASH_REDIS_REST_URL ||
              process.env.UPSTASH_REDIS_URL ||
              process.env.VITE_UPSTASH_REDIS_URL || '';
    let token = process.env.UPSTASH_REDIS_REST_TOKEN ||
                process.env.UPSTASH_REDIS_TOKEN ||
                process.env.VITE_UPSTASH_REDIS_TOKEN || '';

    url = url.trim();
    token = token.trim();

    // Auto-recovery: If user swapped URL and Token in Render environment variables
    if (url && !url.startsWith('http') && token && token.startsWith('http')) {
        console.warn('[Integrity Server] Warning: Upstash Redis URL and Token were reversed in environment variables. Automatically swapping them.');
        const temp = url;
        url = token;
        token = temp;
    }

    return { url, token };
}

function getRedis() {
    if (redisClient) return redisClient;
    if (redisInitialized && !redisClient) return null;

    redisInitialized = true;
    const { url, token } = getRedisCredentials();

    if (!url || !token) {
        console.warn('[Integrity Server] Upstash Redis credentials not configured. Redis caching is disabled.');
        return null;
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
        console.warn(`[Integrity Server] Invalid Redis URL format: "${url}". Upstash requires a URL starting with https://. Redis caching is disabled.`);
        return null;
    }

    try {
        redisClient = new Redis({ url, token });
        console.log('[Integrity Server] Upstash Redis client initialized successfully.');
        return redisClient;
    } catch (err) {
        console.error('[Integrity Server] Failed to initialize Upstash Redis client:', err.message);
        return null;
    }
}

// --- Levenshtein Similarity & Cache Key Utilities ---
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

// --- API Routes ---
app.get('/api/health', (req, res) => {
    const { url, token } = getRedisCredentials();
    const isConfigured = Boolean(url && url.startsWith('http') && token);
    res.json({
        status: 'OK',
        message: 'Integrity API is running',
        redisConfigured: isConfigured,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/cache/check', async (req, res) => {
    const { brand, productName } = req.body || {};
    if (!brand || !productName) {
        return res.json({ hit: false, data: null });
    }

    const redis = getRedis();
    if (!redis) {
        return res.json({ hit: false, data: null, message: 'Redis cache unavailable' });
    }

    const normBrand = brand.trim().toLowerCase();
    const normProduct = productName.trim().toLowerCase();

    try {
        const allEntries = await redis.hgetall(CACHE_HASH);
        if (!allEntries || Object.keys(allEntries).length === 0) {
            console.log(`[Integrity Server] Redis cache empty - MISS for: ${brand} - ${productName}`);
            return res.json({ hit: false, data: null });
        }

        let bestMatch = null;
        let bestScore = 0;

        for (const [, entry] of Object.entries(allEntries)) {
            const data = typeof entry === 'string' ? JSON.parse(entry) : entry;
            const brandSim = stringSimilarity(normBrand, data.brand_lower || '');
            const productSim = stringSimilarity(normProduct, data.product_name_lower || '');

            if (brandSim < 0.7) continue;

            let score = brandSim * 0.3 + productSim * 0.7;

            if (productSim >= 0.9 && brandSim >= 0.8) {
                console.log(`[Integrity Server] Cache HIT (strong: brand=${(brandSim * 100).toFixed(0)}% product=${(productSim * 100).toFixed(0)}%) for: ${brand} - ${productName}`);
                return res.json({ hit: true, data: data.analysisData });
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
            console.log(`[Integrity Server] Cache HIT (fuzzy: score=${(bestScore * 100).toFixed(0)}%) for: ${brand} - ${productName}`);
            return res.json({ hit: true, data: bestMatch.analysisData });
        }

        console.log(`[Integrity Server] Cache MISS for: ${brand} - ${productName}`);
        return res.json({ hit: false, data: null });
    } catch (err) {
        console.warn('[Integrity Server] Redis cache check failed:', err.message);
        return res.json({ hit: false, data: null, error: err.message });
    }
});

app.post('/api/cache/save', async (req, res) => {
    const { brand, productName, analysisData } = req.body || {};
    if (!brand || !productName || !analysisData) {
        return res.status(400).json({ success: false, message: 'Missing brand, productName, or analysisData' });
    }

    const redis = getRedis();
    if (!redis) {
        return res.json({ success: false, message: 'Redis cache unavailable' });
    }

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
        console.log(`[Integrity Server] Redis cached analysis for: ${brand} - ${productName}`);
        return res.json({ success: true });
    } catch (err) {
        console.warn('[Integrity Server] Redis cache save failed:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// --- Static Frontend Serving ---
app.use(express.static(join(__dirname, 'dist'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

app.use((req, res, next) => {
    if (req.path.includes('.')) {
        return res.status(404).send('Not found');
    }
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
