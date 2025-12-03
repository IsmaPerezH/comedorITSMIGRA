import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
// IMPORTANTE: Reemplaza 'TU_API_KEY' y 'TU_APP_ID' con los valores de tu consola de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB1UyG-06h84xrR76Rn-8i82eGNi1jMuH8",
    authDomain: "comedoritsmigra.firebaseapp.com",
    projectId: "comedoritsmigra",
    storageBucket: "comedoritsmigra.firebasestorage.app",
    messagingSenderId: "380034872966",
    appId: "1:380034872966:android:679bd6a8e22a513fe3c307"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
