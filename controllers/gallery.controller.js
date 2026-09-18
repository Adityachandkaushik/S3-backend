import fs from "fs";
import Gallery from "../models/Gallery.model.js";

/* CREATE NEW EVENT */
export const addGallery = async (req, res) => {
  try {
    const imgs = req.files.map(f => ({ path: "/uploads/gallery/" + f.filename }));
    
    const g = await Gallery.create({
      title: req.body.title,
      location: req.body.location,
      date: req.body.date,
      description: req.body.description,
      images: imgs,
    });

    res.json(g);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Gallery creation failed" });
  }
};

/* GET ALL EVENTS */
export const getGallery = async (req, res) => {
  try {
    const g = await Gallery.find().sort({ createdAt: -1 });
    res.json(g);
  } catch (err) {
    res.status(500).json([]);
  }
};

/* DELETE SINGLE PHOTO */
export const deletePhoto = async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const g = await Gallery.findById(id);
    if (!g) return res.status(404).json({ msg: "Event not found" });

    const img = g.images.id(photoId);
    if (!img) return res.status(404).json({ msg: "Photo not found" });

    const p = "." + img.path;
    if (fs.existsSync(p)) fs.unlinkSync(p);

    img.remove();
    await g.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
};

/* REPLACE SINGLE PHOTO */
export const replacePhoto = async (req, res) => {
  try {
    const g = await Gallery.findById(req.params.id);
    if (!g) return res.status(404).json({ msg: "Event not found" });

    const img = g.images.id(req.params.photoId);
    if (!img) return res.status(404).json({ msg: "Photo not found" });

    const old = "." + img.path;
    if (fs.existsSync(old)) fs.unlinkSync(old);

    img.path = "/uploads/gallery/" + req.file.filename;
    await g.save();
    res.json(img);
  } catch (err) {
    res.status(500).json({ msg: "Replace failed" });
  }
};

/* UPDATE TEXT DETAILS */
export const updateGallery = async (req, res) => {
  try {
    const g = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(g);
  } catch {
    res.status(500).json({ msg: "Update failed" });
  }
};

/* DELETE ENTIRE EVENT */
export const deleteGallery = async (req, res) => {
  try {
    const g = await Gallery.findById(req.params.id);
    if (!g) return res.status(404).json({ msg: "Not found" });

    g.images.forEach(i => {
      const p = "." + i.path;
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    await g.deleteOne();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ msg: "Delete failed" });
  }
};
