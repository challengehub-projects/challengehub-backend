import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import dashboardRoutes from "../routes/dashboardRoutes.js";
import paymentRoutes from "../routes/paymentRoutes.js";
import examRoutes from "../routes/examRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/exam", examRoutes);

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.json({ message: "API Running 🚀" });
});

/* IMPORTANT (NO app.listen) */
export default app;