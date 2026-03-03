import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';

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
