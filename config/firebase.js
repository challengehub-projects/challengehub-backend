import admin from "firebase-admin";
import { readFile } from "fs/promises";

let serviceAccount;

// 1. Resolve credentials safely for both Render and your local computer
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    let rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    
    // Strip trailing/leading quotes if Render added them automatically
    if (rawEnv.startsWith('"') && rawEnv.endsWith('"')) {
      rawEnv = rawEnv.slice(1, -1);
    }
    
    // Explicitly fix structural multi-line private key breaks
    rawEnv = rawEnv.replace(/\\n/g, '\n');

    serviceAccount = JSON.parse(rawEnv);
  } catch (parseError) {
    console.error("Failed parsing Render variable. Check string layout formatting.");
    throw parseError;
  }
} else {
  try {
    // Falls back to your local folder path matching your project structure
    const jsonURL = new URL("./serviceAccount.json", import.meta.url);
    serviceAccount = JSON.parse(await readFile(jsonURL, "utf8"));
  } catch (fileError) {
    throw new Error("Firebase credentials missing locally and on Render environment settings.");
  }
}

// 2. Clean check: Initialize safely without crashing if already spun up
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin SDK initialized successfully using Service Account!");
  } else {
    console.log("ℹ️ Firebase Admin SDK was already initialized.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error.message);
}

// 3. Export the standard database hooks cleanly for your backend routes
const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
