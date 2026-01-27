import express from "express";
import {
  createVolunteer,
  getVolunteers,
  updateStatus,
  deleteVolunteer
} from "../controllers/volunteer.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", createVolunteer);
router.get("/all", auth, getVolunteers);
router.put("/status/:id", auth, updateStatus);
router.delete("/:id", auth, deleteVolunteer);   // ✅ ADD THIS LINE

export default router;
