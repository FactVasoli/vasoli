// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZo-4THWVi9nEch_AHOd9qJDQ-3r2GTQA",
  authDomain: "vasoli-1094b.firebaseapp.com",
  projectId: "vasoli-1094b",
  storageBucket: "vasoli-1094b.firebasestorage.app",
  messagingSenderId: "827767436907",
  appId: "1:827767436907:web:f9072b7d398fcfdec2632e",
  measurementId: "G-GRSJ507VQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

export { db };