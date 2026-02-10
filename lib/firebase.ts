import { initializeApp, getApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfowg6iKnDXvcLN9ClPovGxA5hSPhTzpo",
  authDomain: "netflix-clone-fb648.firebaseapp.com",
  projectId: "netflix-clone-fb648",
  storageBucket: "netflix-clone-fb648.firebasestorage.app",
  messagingSenderId: "1047554111160",
  appId: "1:1047554111160:web:cd6f33b53cc16007e8264d",
  measurementId: "G-FWSQ7B7W7W"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
