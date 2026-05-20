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

/* START SERVER WITH RENDER COMPATIBLE PORT AND HOST */
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
