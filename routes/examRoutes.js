// routes/paymentRoutes.js
import express from "express";
import { getScores, submitExam } from "../controllers/examController.js";

const router = express.Router();

router.post("/submit", submitExam);
router.get("/leaderboard", getScores);

export default router;