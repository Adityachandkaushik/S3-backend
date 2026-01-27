import express from "express";
import Volunteer from "../models/Volunteer.model.js";
import Donation from "../models/Donation.js";
import Gallery from "../models/Gallery.model.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

/* ADMIN DASHBOARD STATS */
router.get("/stats", auth, async (req, res) => {
  try {
    const volunteers = await Volunteer.countDocuments();
    const donations = await Donation.countDocuments();
    const activities = await Gallery.countDocuments();

    res.json({
      volunteers,
      donations,
      activities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard error" });
  }
});

export default router;
