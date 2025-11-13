import express from "express";
import Vaccination from "../models/Vaccination.js";
import Deworming from "../models/Deworming.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/upcoming", protect, async (req, res) => {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1); // look ahead 1 year

  // Fetch upcoming vaccinations and dewormings
  const vaccinations = await Vaccination.find({
    nextDueDate: { $gte: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()), $lte: nextYear },
  }).populate("pet", "name species");

  const dewormings = await Deworming.find({
    nextDueDate: { $gte: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()), $lte: nextYear },
  }).populate("pet", "name species");

  // Function to compute status and days left
  const calculateStatus = (nextDueDate) => {
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "Overdue", daysLeft: diffDays };
    if (diffDays <= 30) return { status: "Due Soon", daysLeft: diffDays };
    return { status: "Upcoming", daysLeft: diffDays };
  };

  // Decorate data
  const upcomingVaccinations = vaccinations.map((v) => {
    const { status, daysLeft } = calculateStatus(v.nextDueDate);
    return {
      _id: v._id,
      pet: v.pet,
      vaccineName: v.vaccineName,
      lastDate: v.lastDate,
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
      lastDate: d.lastDate,
      nextDueDate: d.nextDueDate,
      status,
      daysLeft,
    };
  });

  res.json({ upcomingVaccinations, upcomingDewormings });
});

export default router;

