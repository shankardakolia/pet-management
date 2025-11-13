import express from "express";
import Vaccination from "../models/Vaccination.js";
import Pet from "../models/petModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add vaccination record
router.post("/", protect, async (req, res) => {
  try {
    const { pet, vaccineName, dateGiven, notes } = req.body;

    // Check if pet exists
    const petData = await Pet.findById(pet);
    if (!petData) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Auto-calculate next due date = +1 year
    const nextDue = new Date(dateGiven);
    nextDue.setFullYear(nextDue.getFullYear() + 1);

    const record = new Vaccination({
      pet,
      vaccineName,
      dateGiven,
      nextDueDate: nextDue,
      notes,
    });

    const saved = await record.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Vaccination error:", error);
    res.status(500).json({ message: "Error adding vaccination record" });
  }
});

// Get all vaccinations for a pet
router.get("/:petId", protect, async (req, res) => {
  const records = await Vaccination.find({ pet: req.params.petId });
  res.json(records);
});

export default router;

