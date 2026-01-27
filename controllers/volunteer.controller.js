import Volunteer from "../models/Volunteer.model.js";

export const createVolunteer = async (req, res) => {
  const volunteer = await Volunteer.create(req.body);
  res.json({ success: true, volunteer });
};

export const getVolunteers = async (req, res) => {
  const data = await Volunteer.find().sort({ _id: -1 });
  res.json(data);
};

export const updateStatus = async (req, res) => {
  await Volunteer.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ success: true });
};

// ✅ ADD THIS FUNCTION AT THE BOTTOM
export const deleteVolunteer = async (req, res) => {
  await Volunteer.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Volunteer deleted" });
};
