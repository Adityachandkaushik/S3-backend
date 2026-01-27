import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/login", (req, res) => {
  console.log(req.body);   // 👈 DEBUG

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email & Password required" });

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid Credentials" });
});

export default router;
