import mongoose from "mongoose";

const vaccinationSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  vaccineName: { type: String, required: true },
  dateGiven: { type: Date, required: true },
  nextDueDate: { type: Date },
  notes: { type: String },
});

export default mongoose.model("Vaccination", vaccinationSchema);

