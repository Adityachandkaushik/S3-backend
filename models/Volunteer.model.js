import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  address: String,
  skills: String,
  message: String,
  date: String,
  status: { type: String, default: "Pending" }
});

export default mongoose.model("Volunteer", VolunteerSchema);
