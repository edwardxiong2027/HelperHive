import { getApp, getApps, initializeApp } from 'firebase/app';

// Firebase configuration for mindmap-9f454 project (HelperHive app)
const firebaseConfig = {
  apiKey: "AIzaSyCXEtq0ubgtXIbb7s_JzoWt8daNejKwuLQ",
  authDomain: "mindmap-9f454.firebaseapp.com",
  projectId: "mindmap-9f454",
  storageBucket: "mindmap-9f454.firebasestorage.app",
  messagingSenderId: "582191293462",
  appId: "1:582191293462:web:3e9d046f37e79bf0538137"
};

// Initialize once and reuse across the app
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default firebaseApp;
