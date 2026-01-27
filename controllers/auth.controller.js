const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Fixed ENV credentials
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Unauthorized Admin" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
};
