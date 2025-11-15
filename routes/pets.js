import express from "express";
import asyncHandler from "express-async-handler";
import Pet from "../models/petModel.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper function to calculate age
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const now = new Date();

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let result = "";
  if (years > 0) result += `${years} year${years > 1 ? "s" : ""} `;
  if (months > 0) result += `${months} month${months > 1 ? "s" : ""} `;
  if (days > 0) result += `${days} day${days > 1 ? "s" : ""}`;

  return result.trim() || "0 days";
}

//
// -----------------------------------------------------
// GET ALL PETS
// -----------------------------------------------------
// @desc    Get all pets
// @route   GET /api/pets
// @access  Private
//
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const pets = await Pet.find({ owner: req.user._id });

    const petsWithAge = pets.map((pet) => ({
      ...pet.toObject(),
      age: calculateAge(pet.dateOfBirth),
    }));

    res.json(petsWithAge);
  })
);

//
// -----------------------------------------------------
// CREATE PET
// -----------------------------------------------------
// @desc    Add new pet
// @route   POST /api/pets
// @access  Private
//
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { name, species, breed, dateOfBirth, notes } = req.body;

    const pet = new Pet({
      name,
      species,
      breed,
      dateOfBirth,
      owner: req.user._id,
      notes,
    });

    const createdPet = await pet.save();
    res.status(201).json(createdPet);
  })
);

//
// -----------------------------------------------------
// GET PET DETAILS (MISSING ROUTE ADDED)
// -----------------------------------------------------
// @desc    Get details of ONE pet
// @route   GET /api/pets/:id
// @access  Private
//
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const pet = await Pet.findOne({
      _id: req.params.id,
      owner: req.user._id, // Prevent user from accessing others’ pets
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const petObj = pet.toObject();
    petObj.age = calculateAge(pet.dateOfBirth);

    res.json(petObj);
  })
);

export default router;
