import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { HelpRequest, KindnessEntry, NewHelpRequestInput, NewKindnessEntryInput, UpdateHelpRequestInput } from '../types';

const mapRequest = (snapshot: any): HelpRequest => {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    originalText: data.originalText || '',
    polishedText: data.polishedText || data.originalText || '',
    category: data.category || 'Other',
    status: data.status || 'Open',
    author: data.author || 'Anonymous',
    authorId: data.authorId,
    authorPhotoUrl: data.authorPhotoUrl,
    emoji: data.emoji || '📝',
    createdAt: data.createdAt?.toMillis?.() || Date.now(),
    imageUrl: data.imageUrl,
  };
};

const mapKindnessEntry = (snapshot: any): KindnessEntry => {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    action: data.action || '',
    aiResponse: data.aiResponse || '',
    timestamp: data.timestamp?.toMillis?.() || Date.now(),
    tags: data.tags || [],
    imageUrl: data.imageUrl,
    userId: data.userId,
  };
};

export const subscribeToRequests = (onChange: (requests: HelpRequest[]) => void) => {
  const requestsRef = collection(db, 'requests');
  const q = query(requestsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(mapRequest);
    onChange(list);
  });
};

export const createHelpRequest = async (payload: NewHelpRequestInput) => {
  const requestsRef = collection(db, 'requests');
  const docRef = await addDoc(requestsRef, {
    ...payload,
    status: 'Open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateHelpRequest = async (payload: UpdateHelpRequestInput) => {
  const { id, ...rest } = payload;
  const docRef = doc(db, 'requests', id);
  await updateDoc(docRef, {
    ...rest,
    updatedAt: serverTimestamp(),
  });
};

export const markHelpRequestMatched = async (id: string, helperName?: string) => {
  const docRef = doc(db, 'requests', id);
  await updateDoc(docRef, {
    status: 'Matched',
    matchedBy: helperName,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToKindnessEntries = (
  userId: string,
  onChange: (entries: KindnessEntry[]) => void
) => {
  const entriesRef = collection(db, 'users', userId, 'kindnessEntries');
  const q = query(entriesRef, orderBy('timestamp', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(mapKindnessEntry);
    onChange(list);
  });
};

export const createKindnessEntry = async (userId: string, payload: NewKindnessEntryInput) => {
  if (!userId) return;
  const entriesRef = collection(db, 'users', userId, 'kindnessEntries');
  await addDoc(entriesRef, {
    ...payload,
    userId,
    tags: [],
    timestamp: serverTimestamp(),
  });
};
