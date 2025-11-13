import express from "express";
import Deworming from "../models/Deworming.js";
import Pet from "../models/petModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add deworming record
router.post("/", protect, async (req, res) => {
  try {
    const { pet, medicineName, dateGiven, notes } = req.body;

    // Fetch pet to determine its age
    const petData = await Pet.findById(pet);
    if (!petData) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const dob = new Date(petData.dateOfBirth);
    const today = new Date(dateGiven);
    const ageInYears = (today - dob) / (1000 * 60 * 60 * 24 * 365.25);

    const nextDue = new Date(dateGiven);
    if (ageInYears <= 1) {
      nextDue.setMonth(nextDue.getMonth() + 2); // +2 months
    } else {
      nextDue.setMonth(nextDue.getMonth() + 3); // +3 months
    }

    const record = new Deworming({
      pet,
      medicineName,
      dateGiven,
      nextDueDate: nextDue,
      notes,
    });

    const saved = await record.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Deworming error:", error);
    res.status(500).json({ message: "Error adding deworming record" });
  }
});

// Get all dewormings for a pet
router.get("/:petId", protect, async (req, res) => {
  const records = await Deworming.find({ pet: req.params.petId });
  res.json(records);
});

export default router;

