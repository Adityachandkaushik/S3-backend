import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  path:String
},{_id:true});

const gallerySchema = new mongoose.Schema({
  title:String,
  location:String,
  date:String,
  description:String,
  images:[imageSchema]
},{timestamps:true});

export default mongoose.model("Gallery", gallerySchema);
