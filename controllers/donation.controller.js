const Donation = require("../models/Donation");

/* Add Donation */
exports.addDonation = async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Get All Donations */
exports.getAllDonations = async (req, res) => {
  const data = await Donation.find().sort({ createdAt: -1 });
  res.json(data);
};

/* Delete Donation */
exports.deleteDonation = async (req, res) => {
  await Donation.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* Dashboard Stats */
exports.getStats = async (req, res) => {
  const stats = await Donation.aggregate([
    { $group: { _id: null, sum: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);
  res.json(stats[0] || { sum: 0, count: 0 });
};
