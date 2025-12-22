import { getApp, getApps, initializeApp } from 'firebase/app';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!apiKey) {
  // Fail fast so we never initialize with an undefined key
  throw new Error('Missing VITE_FIREBASE_API_KEY environment variable');
}

const firebaseConfig = {
  apiKey,
  authDomain: 'helperhive-b03e7.firebaseapp.com',
  projectId: 'helperhive-b03e7',
  storageBucket: 'helperhive-b03e7.firebasestorage.app',
  messagingSenderId: '102350131504',
  appId: '1:102350131504:web:bf6985c0df6098134478f5'
};

// Initialize once and reuse across the app
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default firebaseApp;
