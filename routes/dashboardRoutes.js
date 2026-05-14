import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { db } from "../config/firebase.js";

const router = express.Router();

router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Welcome to dashboard",
      user: userDoc.data(),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Welcome to dashboard",
      user: userDoc.data(),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* router.get("/profile", verifyToken, async (req, res) => {
  try {
    const uid = req.body;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
     userData: userDoc 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); */

export default router;