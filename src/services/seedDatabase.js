import { db } from './firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { HARMFUL_INGREDIENTS } from './harmfulIngredients';

export async function seedHarmfulIngredients() {
  const collRef = collection(db, 'harmful_ingredients');
  const existing = await getDocs(collRef);

  if (!existing.empty) {
    console.log(`[Integrity] Harmful ingredients already seeded (${existing.size} docs). Skipping.`);
    return false;
  }

  console.log(`[Integrity] Seeding ${HARMFUL_INGREDIENTS.length} harmful ingredients...`);

  const promises = HARMFUL_INGREDIENTS.map((item, index) => {
    const docId = item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    return setDoc(doc(db, 'harmful_ingredients', docId), {
      name: item.name,
      altNames: item.altNames || [],
      score: item.score,
      category: item.category,
      reason: item.reason,
      index: index
    });
  });

  await Promise.all(promises);
  console.log(`[Integrity] Successfully seeded ${HARMFUL_INGREDIENTS.length} harmful ingredients.`);
  return true;
}
