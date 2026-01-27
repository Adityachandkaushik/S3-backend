import express from "express";
import upload from "../middleware/galleryUpload.js";
import protect from "../middleware/auth.middleware.js";
import {
 addGallery, getGallery, deletePhoto, replacePhoto, updateGallery, deleteGallery
} from "../controllers/gallery.controller.js";

const router = express.Router();

router.post("/add", protect, upload.array("images",5), addGallery);
router.get("/all", getGallery);

router.delete("/:id", protect, deleteGallery);
router.put("/:id", protect, updateGallery);
router.delete("/:id/photo/:photoId", protect, deletePhoto);
router.put("/:id/photo/:photoId", protect, upload.single("image"), replacePhoto);

export default router;
