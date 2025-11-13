import mongoose from "mongoose";

const dewormingSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  medicineName: { type: String, required: true },
  dateGiven: { type: Date, required: true },
  nextDueDate: { type: Date },
  notes: { type: String },
});

export default mongoose.model("Deworming", dewormingSchema);

