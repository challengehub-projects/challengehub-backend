import express from "express";
import { signup, login, getProfile, signOutUser, getUserByUid, updateAccount, deleteAccount } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/signout", signOutUser);
router.post("/user", getUserByUid);
router.patch("/update", verifyToken, updateAccount);
router.delete("/delete", verifyToken, deleteAccount);


export default router;