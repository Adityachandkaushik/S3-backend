import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

import volunteerRoutes from "./routes/volunteer.routes.js";
import authRoutes from "./routes/auth.routes.js";    
import donationRoutes from "./routes/donation.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());

// 🔥 THESE TWO LINES FIX YOUR WHOLE PROJECT
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gallery", galleryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
