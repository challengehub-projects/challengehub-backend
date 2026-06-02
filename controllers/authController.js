  import axios from "axios";
import { admin, db, auth } from "../config/firebase.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";


dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const API_KEY = process.env.FIREBASE_API_KEY;

/* -------- SIGNUP -------- */
export const signup = async (req, res) => {
  try {
    const { email, password, surname, otherNames, category, state, lga, phone, school } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const user = await auth.createUser({
      email,
      password,
    });

    console.log(`body: ${school}`)

    await db.collection("users").doc(user.uid).set({
      surname,
      otherNames,
      email,
      category: category || "unknown",
      role: "student",
      paymentStatus: "paid",
      hasTakenQuiz: false,
      state,
      lga,
      school,
      phone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      uid: user.uid,
    });

  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* -------- LOGIN -------- */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token: response.data.idToken,
      refreshToken: response.data.refreshToken,
      userId: response.data.localId,
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        err.response?.data?.error?.message ||
        "Login failed",
    });
  }
};


/* -------- GET USER PROFILE -------- */
export const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        uid,
        ...userDoc.data(),
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const signOutUser = async (req, res) => {
  try {
    const { uid } = req.body;

    console.log(uid)

    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    // Revoke all refresh tokens (logs user out everywhere)
    await admin.auth().revokeRefreshTokens(uid);

    return res.status(200).json({
      message: "User signed out successfully",
    });
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.body;


    console.log(uid)

    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
};



// ✅ PARTIAL UPDATE ACCOUNT
/* export const updateAccount = async (req, res) => {
  const uid = req.user.uid;

  const {
    email,
    displayName,
    phone,
    state,
    lga,
    category,
  } = req.body;

  try {
    // 🔹 Build dynamic update object for Firebase Auth
    const authUpdateData = {};
    if (email) authUpdateData.email = email;
    if (displayName) authUpdateData.displayName = displayName;

    // Only call if something exists
    if (Object.keys(authUpdateData).length > 0) {
      await admin.auth().updateUser(uid, authUpdateData);
    }

    // 🔹 Build dynamic Firestore update
    const firestoreData = {};
    if (email) firestoreData.email = email;
    if (displayName) firestoreData.name = displayName;
    if (phone) firestoreData.phone = phone;
    if (state) firestoreData.state = state;
    if (lga) firestoreData.lga = lga;
    if (category) firestoreData.category = category;

    firestoreData.updatedAt =
      admin.firestore.FieldValue.serverTimestamp();

    if (Object.keys(firestoreData).length > 0) {
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set(firestoreData, { merge: true });
    }

    res.json({ message: "Account updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update account" });
  }
};
 */
// ✅ PARTIAL UPDATE ACCOUNT
export const updateAccount = async (req, res) => {
  try {
    const uid = req.user.uid;

    const {
      email,
      surname,
      otherNames,
      phone,
      state,
      lga,
      school,
      category,
      profilePic, 
    } = req.body;

    console.log("BODY RECEIVED:", email, surname, otherNames, phone, state, lga, school, category, profilePic);

    // 🔹 Firebase Auth update
    const authUpdateData = {};

    if (email) authUpdateData.email = email;
    if (profilePic) authUpdateData.photoURL = profilePic;

    // NOTE: Removed phoneNumber from Auth to prevent strict international formatting crashes.
    // The phone number remains 100% safe and tracked inside your Firestore collection below.

    if (Object.keys(authUpdateData).length > 0) {
      await admin.auth().updateUser(uid, authUpdateData);
    }

    // 🔹 Firestore update
    const firestoreData = {};

    if (email) firestoreData.email = email;
    if (surname) firestoreData.surname = surname;
    if (otherNames) firestoreData.otherNames = otherNames;
    if (phone) firestoreData.phone = phone; // Safely saved in Firestore
    if (state) firestoreData.state = state;
    if (lga) firestoreData.lga = lga;
    if (school) firestoreData.school = school;
    if (category) firestoreData.category = category;
    if (profilePic) firestoreData.profilePic = profilePic; 

    firestoreData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    if (Object.keys(firestoreData).length > 0) {
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set(firestoreData, { merge: true });
    }

    return res.status(200).json({
      success: true,
      message: "Account updated successfully",
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to update account",
    });
  }
};


/* export const updateAccount = async (req, res) => {
  try {
    const uid = req.user.uid;

    const {
      email,
      surname,
      othernames,
      phone,
      state,
      lga,
      school,
      category,
    } = req.body;

    console.log("BODY RECEIVED:", req.body);

    // 🔹 Firebase Auth update
    const authUpdateData = {};

    if (email) authUpdateData.email = email;
    if (surname) authUpdateData.surname = surname;
    if (othernames) authUpdateData.othernames = othernames;
    if (phone) authUpdateData.phone = surname;
    if (state) authUpdateData.state = state;
    if (school) authUpdateData.lga = school;
    if (lga) authUpdateData.lga = lga;
    if (category) authUpdateData.category = category;

    if (Object.keys(authUpdateData).length > 0) {
      await admin.auth().updateUser(uid, authUpdateData);
    }

    // 🔹 Firestore update
    const firestoreData = {};

    if (email) firestoreData.email = email;
    if (surname) firestoreData.surname = surname;
    if (othernames) firestoreData.othernames = othernames;
    if (phone) firestoreData.phone = phone;
    if (state) firestoreData.state = state;
    if (lga) firestoreData.lga = lga;
    if (school) firestoreData.school = school;
    if (category) firestoreData.category = category;

    firestoreData.updatedAt =
      admin.firestore.FieldValue.serverTimestamp();

    if (Object.keys(firestoreData).length > 0) {
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set(firestoreData, { merge: true });
    }

    return res.status(200).json({
      success: true,
      message: "Account updated successfully",
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update account",
    });
  }
};
 */

// DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  const uid = req.user.uid;

  try {
    // 🔹 Delete Firestore data first
    await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .delete()
      .catch(() => { }); // avoid crash if doc doesn't exist

    // 🔹 Delete Firebase Auth user
    await admin.auth().deleteUser(uid);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};