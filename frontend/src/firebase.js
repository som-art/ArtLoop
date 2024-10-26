// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "art-loop.firebaseapp.com",
  projectId: "art-loop",
  storageBucket: "art-loop.appspot.com",
  messagingSenderId: "12430435701",
  appId: "1:12430435701:web:a00dbe4b789a95affc5f3c",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
