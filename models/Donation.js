const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  amount: Number,
  mode: String,
  transactionId: String,
  purpose: String,
  date: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Donation", donationSchema);
