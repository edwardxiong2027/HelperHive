import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export const upsertUserProfile = async (user: User) => {
  if (!user) return;

  const profile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'HelperBee',
    email: user.email,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  await upsertUserProfile(result.user);
  return result.user;
};

export const loginOrCreateWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await upsertUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found') {
      const created = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(created.user, { displayName });
      }
      await upsertUserProfile(created.user);
      return created.user;
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
