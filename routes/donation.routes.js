const express = require("express");
const Donation = require("../models/Donation");
const auth = require("../middleware/auth.middleware");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/* ============================
   Add Donation (Public)
============================ */
router.post("/add", async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.json({ success: true, message: "Donation saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ============================
   Get All Donations (Admin)
============================ */
router.get("/all", auth, async (req, res) => {
  try {
    const data = await Donation.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   Update Donation Status (Admin)
============================ */
router.put("/status/:id", auth, async (req, res) => {
  try {
    await Donation.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   Delete Donation (Admin)
============================ */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Donation deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   Dashboard Donation Stats
============================ */
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      { $group: { _id: null, sum: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    res.json(stats[0] || { sum: 0, count: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==================================================
   MODERN PROFESSIONAL PDF RECEIPT (CLEAN VERSION)
================================================== */
const generateReceipt = async (req, res) => {
  try {
    const d = await Donation.findById(req.params.id);

    if (!d) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const logoPath = path.join(__dirname, "../pdfimage/logo.png");
    const stampPath = path.join(__dirname, "../pdfimage/stamp.png");

    // ✅ ROBUST CLEANING LOGIC
    // .normalize("NFKD") breaks down special chars like ¹ into base components
    // .replace(/[^\d.]/g, "") removes everything except numbers and decimals
    const rawValue = String(d.amount || "0").normalize("NFKD");
    const cleanNumber = rawValue.replace(/[^\d.]/g, "");
    const numericAmount = parseFloat(cleanNumber);
    
    // Format for display (Indian Numbering System)
   const formattedAmount = d.amount
  ? d.amount.toLocaleString("en-IN")
  : "0";


    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Donation_Receipt_${d.name.replace(/\s+/g, "_")}.pdf`
    );

    const doc = new PDFDocument({ margin: 0, size: "A4" });
    doc.pipe(res);

    // Page Background
    doc.rect(0, 0, 612, 792).fill("#f1f5f9");

    // Watermark
    if (fs.existsSync(logoPath)) {
      doc.save();
      doc.opacity(0.05);
      doc.image(logoPath, 150, 300, { width: 312 });
      doc.restore();
    }

    // Header Bar
    doc.rect(0, 0, 612, 100).fill("#98d831");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 510, 20, { width: 80 });
    }

    doc.fillColor("#000000")
      .fontSize(26)
      .font("Helvetica-Bold")
      .text("DONATION RECEIPT", 50, 35);

    doc.fontSize(10)
      .fillColor("#000000")
      .font("Helvetica")
      .text("Official Record of Contribution", 50, 65);

    // Main Card
    doc.roundedRect(52, 120, 508, 600, 8).fill("#cbd5e1");
    doc.roundedRect(50, 118, 508, 600, 8).fill("#ffffff");
    doc.rect(50, 118, 6, 600).fill("#3b82f6");

    // Amount Highlight Box
    doc.roundedRect(390, 140, 150, 50, 5).fill("#eff6ff");
    doc.rect(390, 140, 150, 50).stroke("#3b82f6");

    doc.fontSize(11)
      .fillColor("#64748b")
      .text("Total Amount", 400, 150);

    doc.fontSize(20)
  .fillColor("#51b33d")
  .font("Helvetica-Bold")
  .text(`Rs. ${ formattedAmount}`, 400, 165, { width: 130 });


    // Donor Details
    let y = 220;

    doc.fontSize(16)
      .fillColor("#0f172a")
      .font("Helvetica-Bold")
      .text("Donor Information", 80, y);

    y += 20;
    doc.moveTo(80, y).lineTo(530, y).lineWidth(1).stroke("#e2e8f0");
    y += 20;

    const drawRow = (label, value, isBold = false) => {
      doc.fontSize(11)
        .fillColor("#64748b")
        .font("Helvetica")
        .text(label, 80, y);

      doc.fontSize(12)
        .fillColor("#1e293b")
        .font(isBold ? "Helvetica-Bold" : "Helvetica")
        .text(String(value || "N/A"), 220, y);

      y += 30;
    };

    drawRow("Receipt ID:", d._id.toString().substring(0, 12) + "...");
    drawRow("Full Name:", d.name, true);
    drawRow("Email:", d.email);
    drawRow("Mobile:", d.mobile);
    const dateObj = new Date(d.date || Date.now());
    drawRow("Date:", dateObj.toLocaleDateString());

    // Transaction Details
    y += 10;
    doc.rect(80, y, 430, 1).fill("#e2e8f0");
    y += 20;

    doc.fontSize(16)
      .fillColor("#0f172a")
      .font("Helvetica-Bold")
      .text("Transaction Details", 80, y);

    y += 20;
    doc.moveTo(80, y).lineTo(530, y).stroke("#e2e8f0");
    y += 20;

    drawRow("Mode:", d.mode);
    drawRow("Transaction ID:", d.transactionId);
    drawRow("Purpose:", d.purpose);

    // Status Badge
    y += 10;
    let statusText = String(d.status || "PENDING").toUpperCase();
    let badgeColor = "#64748b";
    let badgeBg = "#f1f5f9";

    if (["SUCCESS", "COMPLETED", "APPROVED"].includes(statusText)) {
      badgeColor = "#15803d";
      badgeBg = "#dcfce7";
    } else if (statusText === "PENDING") {
      badgeColor = "#b45309";
      badgeBg = "#ffedd5";
    }

    const badgeWidth = doc.widthOfString(statusText) + 30;
    doc.roundedRect(80, y, badgeWidth, 24, 12).fill(badgeBg);
    doc.fillColor(badgeColor)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(statusText, 80, y + 8, { width: badgeWidth, align: "center" });

    // Footer & Stamp
    const footerY = 600;

    if (fs.existsSync(stampPath)) {
      doc.image(stampPath, 70, footerY - 10, { width: 120 });
    }

    doc.fillColor("#3b82f6")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Thank You!", 0, footerY + 80, { align: "center" });

    doc.fillColor("#64748b")
      .fontSize(11)
      .font("Helvetica")
      .text("Your generosity helps us serve the community.", 0, footerY + 100, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).json({ message: "Error generating receipt" });
  }
};

router.get("/receipt/:id", auth, generateReceipt);

module.exports = router;