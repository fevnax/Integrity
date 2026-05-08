import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    limit
} from 'firebase/firestore';

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

function ingredientSimilarity(ingredientsA, ingredientsB) {
    if (!ingredientsA?.length || !ingredientsB?.length) return 0;
    const setA = new Set(ingredientsA.map(n => n.toLowerCase().trim()));
    const setB = new Set(ingredientsB.map(n => n.toLowerCase().trim()));
    let matches = 0;
    for (const item of setA) {
        if (setB.has(item)) {
            matches++;
        } else {
            for (const b of setB) {
                if (stringSimilarity(item, b) >= 0.85) {
                    matches++;
                    break;
                }
            }
        }
    }
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : matches / union;
}

export async function checkCache(brand, productName) {
    if (!brand || !productName) return null;

    const normBrand = brand.trim().toLowerCase();
    const normProduct = productName.trim().toLowerCase();

    try {
        const cacheRef = collection(db, 'analysis_cache');
        const allQ = query(cacheRef, orderBy('cachedAt', 'desc'), limit(50));
        const snapshot = await getDocs(allQ);

        if (snapshot.empty) {
            console.log('[Integrity] Cache empty — MISS');
            return null;
        }

        let bestMatch = null;
        let bestScore = 0;

        for (const d of snapshot.docs) {
            const data = d.data();
            const brandSim = stringSimilarity(normBrand, data.brand_lower || '');
            const productSim = stringSimilarity(normProduct, data.product_name_lower || '');

            if (brandSim < 0.7) continue;

            let score = brandSim * 0.3 + productSim * 0.7;

            if (productSim >= 0.9 && brandSim >= 0.8) {
                console.log(`[Integrity] Cache HIT (strong: brand=${(brandSim*100).toFixed(0)}% product=${(productSim*100).toFixed(0)}%) for: ${brand} - ${productName}`);
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
            console.log(`[Integrity] Cache HIT (fuzzy: score=${(bestScore*100).toFixed(0)}%) for: ${brand} - ${productName}`);
            return bestMatch.analysisData;
        }

        console.log('[Integrity] Cache MISS for:', brand, '-', productName);
        return null;
    } catch (err) {
        console.warn('[Integrity] Cache check failed:', err.message);
        return null;
    }
}

export async function cacheAnalysis(brand, productName, analysisData) {
    if (!brand || !productName) return;

    try {
        const cacheKey = generateCacheKey(brand, productName);
        const cacheRef = doc(db, 'analysis_cache', cacheKey);
        const cleanData = { ...analysisData };
        delete cleanData.imagePreview;
        delete cleanData.matched_harmful;

        const ingredientNames = (analysisData.ingredients || [])
            .map(i => i.normalized || i.original)
            .filter(Boolean);

        await setDoc(cacheRef, {
            brand_lower: brand.trim().toLowerCase(),
            product_name_lower: productName.trim().toLowerCase(),
            ingredient_names: ingredientNames,
            analysisData: cleanData,
            cachedAt: serverTimestamp()
        });
        console.log('[Integrity] Cached analysis for:', brand, '-', productName);
    } catch (err) {
        console.warn('[Integrity] Cache save failed:', err.message);
    }
}

export async function saveAnalysis(userId, analysisData, imageDataUrl) {
    const analysesRef = collection(db, 'users', userId, 'analyses');
    const docRef = await addDoc(analysesRef, {
        ...analysisData,
        imagePreview: imageDataUrl || null,
        createdAt: serverTimestamp()
    });
    return docRef.id;
}

export async function getAnalyses(userId) {
    const analysesRef = collection(db, 'users', userId, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));
}

export async function getAnalysis(userId, analysisId) {
    const docRef = doc(db, 'users', userId, 'analyses', analysisId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
}

export async function deleteAnalysis(userId, analysisId) {
    const docRef = doc(db, 'users', userId, 'analyses', analysisId);
    await deleteDoc(docRef);
}
