import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function analyzeIngredients(imageBase64, mimeType, providedProductName) {
  const textPart = {
    text: `You are "Nutritional Analysis Engine" - an expert in food science, nutrition labels, and ingredient risk analysis.
TASK: Analyse the provided image of a packaged food product's ingredients list.
OPTIONAL CONTEXT: ${providedProductName ? `The user suggests the product name may be: "${providedProductName}". Use this only as a hint, never as a fact.` : 'No product name was provided.'}
EXTRACTION RULES:
- Extract product name, brand, and barcode ONLY if visible or strongly implied by the image.
- Perform OCR conservatively; if text is blurry, partial, or cut off, reduce confidence.
- Preserve the original ingredient token exactly as written on the label.
- Extract ALL ingredients, including sub-ingredients inside parentheses.
INGREDIENT PARSING:
For EACH ingredient:
- original: exact label text
- normalized: standardised food-science name (e.g. "E621" should be normalized to "Monosodium Glutamate")
- category MUST be one of: "allergen", "additive", "sweetener", "preservative", "filler", "spice", "ingredient", "unknown"
- is_allergen: true ONLY for confirmed allergens (milk, soy, nuts, gluten, egg, sesame, etc.)
- is_added_sugar: true for sucrose, glucose syrup, fructose, maltodextrin, HFCS, etc.
- e_number: populate if explicitly labelled OR if you know the standard E-number for the ingredient
- confidence: 0.0-1.0 per ingredient
ANALYSIS RULES:
- Do NOT classify base food ingredients as additives.
- Prefer false negatives over false positives.
- If classification is uncertain, use "unknown".
- Identify high sugar or high salt only when clearly supported.
NOTE: Risk scoring is handled separately by custom algorithm. Set risk_score to 0 and badge to "green" as placeholders.
CONFIDENCE:
- confidence: overall confidence score from 0.0 to 1.0
- confidence_low: true if OCR or inference reliability is low
- suggestions: actionable recapture advice
OUTPUT:
Return ONLY a valid JSON object.
The response MUST strictly adhere to the provided schema.
Do NOT include markdown or explanatory text.`
  };

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType
    }
  };

  const schema = {
    type: 'OBJECT',
    properties: {
      product_name: { type: 'STRING', nullable: true },
      brand: { type: 'STRING', nullable: true },
      barcode: { type: 'STRING', nullable: true },
      summary: { type: 'STRING' },
      ingredients: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            original: { type: 'STRING' },
            normalized: { type: 'STRING' },
            category: { type: 'STRING' },
            is_allergen: { type: 'BOOLEAN' },
            is_added_sugar: { type: 'BOOLEAN' },
            e_number: { type: 'STRING', nullable: true },
            confidence: { type: 'NUMBER' }
          }
        }
      },
      risk_score: { type: 'NUMBER' },
      badge: { type: 'STRING' },
      key_findings: { type: 'ARRAY', items: { type: 'STRING' } },
      confidence: { type: 'NUMBER' },
      confidence_low: { type: 'BOOLEAN' },
      suggestions: { type: 'ARRAY', items: { type: 'STRING' } }
    }
  };

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      const jsonString = response.text.trim();
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`[Integrity] Gemini API error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error?.message || error);

      // Don't retry on non-transient errors
      const status = error?.status || error?.httpStatusCode;
      const msg = (error?.message || '').toLowerCase();

      if (status === 429 || msg.includes('quota') || msg.includes('rate')) {
        if (attempt < MAX_RETRIES) {
          console.log(`[Integrity] Rate limited - retrying in 2s...`);
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw new Error('API rate limit reached. Please wait a moment and try again.');
      }

      if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
        if (attempt < MAX_RETRIES) {
          console.log(`[Integrity] Network error - retrying in 1.5s...`);
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        throw new Error('Network error. Please check your connection and try again.');
      }

      // For any other error, retry once then give up
      if (attempt < MAX_RETRIES) {
        console.log(`[Integrity] Unexpected error - retrying in 1.5s...`);
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }

      throw new Error('Analysis failed. Please try again.');
    }
  }
}
