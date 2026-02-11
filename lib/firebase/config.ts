
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase defensively for build time/SSR
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

const isConfigValid =
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 10 &&
    firebaseConfig.apiKey !== "undefined";

if (isConfigValid) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

        // Firestore and Storage are generally safe to initialize on the server
        db = getFirestore(app);
        storage = getStorage(app);

        // Auth is VERY picky and often crashes during Next.js Prerendering/Build
        // if it detects an environment it doesn't like or missing credentials.
        // Only initialize it on the client side.
        if (typeof window !== "undefined") {
            auth = getAuth(app);
        }
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

export { app, auth, db, storage };
