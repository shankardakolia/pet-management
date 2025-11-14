import express from "express";
import Vaccination from "../models/Vaccination.js";
import Deworming from "../models/Deworming.js";
import Pet from "../models/petModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/upcoming", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    // Find pets owned by the logged-in user
    const userPets = await Pet.find({ owner: userId }).select("_id");
    const petIds = userPets.map((pet) => pet._id);

    // Fetch upcoming vaccinations and dewormings only for these pets
    const vaccinations = await Vaccination.find({
      pet: { $in: petIds },
      nextDueDate: { $gte: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()), $lte: nextYear },
    }).populate("pet", "name species");

    const dewormings = await Deworming.find({
      pet: { $in: petIds },
      nextDueDate: { $gte: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()), $lte: nextYear },
    }).populate("pet", "name species");

    // Calculate status and days left
    const calculateStatus = (nextDueDate) => {
      const dueDate = new Date(nextDueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { status: "Overdue", daysLeft: diffDays };
      if (diffDays <= 30) return { status: "Due Soon", daysLeft: diffDays };
      return { status: "Upcoming", daysLeft: diffDays };
    };

    const upcomingVaccinations = vaccinations.map((v) => {
      const { status, daysLeft } = calculateStatus(v.nextDueDate);
      return {
        _id: v._id,
        pet: v.pet,
        vaccineName: v.vaccineName,
        dateGiven: v.dateGiven,
        nextDueDate: v.nextDueDate,
        status,
        daysLeft,
      };
    });

    const upcomingDewormings = dewormings.map((d) => {
      const { status, daysLeft } = calculateStatus(d.nextDueDate);
      return {
        _id: d._id,
        pet: d.pet,
        medicineName: d.medicineName,
        dateGiven: d.dateGiven,
        nextDueDate: d.nextDueDate,
        status,
        daysLeft,
      };
    });

    res.json({ upcomingVaccinations, upcomingDewormings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
