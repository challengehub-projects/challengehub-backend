import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
// ... your other imports (cors, routes, etc.)

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import examRoutes from "./routes/examRoutes.js";

dotenv.config();

const app = express();

// 1. ALWAYS ENABLE CORS FIRST
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'], // Allow both common Vite ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// 2. CRITICAL FIX: MOVE PARSERS HERE (ABOVE THE ROUTES)
// Now your server knows how to read JSON before the request hits your handlers!
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/* 3. ROUTES ARE NOW PLACED SAFELY BELOW THE PARSERS */
app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/exam", examRoutes);

/* START SERVER WITH RENDER COMPATIBLE PORT AND HOST */
// Change this line:
// To this:
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running");
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
