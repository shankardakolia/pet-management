import mongoose from 'mongoose';

const petSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String },
    dateOfBirth: { type: Date, required: true },
    owner: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Pet = mongoose.model('Pet', petSchema);
export default Pet;

