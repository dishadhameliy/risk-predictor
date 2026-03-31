import { initializeApp } from "firebase/app"
import {
    getAuth,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyCNzYGp8pGsOdcRKzAME19-i-N3yUo-4-4",      // ← replace with your Web API Key from Firebase Console
    authDomain: "risk-predictor-7d635.firebaseapp.com",
    databaseURL: "https://risk-predictor-7d635-default-rtdb.firebaseio.com/",
    projectId: "risk-predictor-7d635",
    storageBucket: "risk-predictor-7d635.appspot.com",
    messagingSenderId: "112287437617235870972",
    appId: "1:329409576129:web:feab4023476743d7d4a840"  // ← replace with your actual App ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
auth.useDeviceLanguage();

export {
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}

export default app
