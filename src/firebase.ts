// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBmisJZh_W1Ho9EOl7FdynVPui1EZHILQ",
  authDomain: "kiiski-movies.firebaseapp.com",
  projectId: "kiiski-movies",
  storageBucket: "kiiski-movies.appspot.com",
  messagingSenderId: "793012988931",
  appId: "1:793012988931:web:233a97c33028e2d3a13236"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
