
const express = require("express");
const mongoose = require("mongoose");
const Club = require("../models/Club");
const Student = require("../models/Student");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all active clubs
router.get("/", async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true }).sort({ name: 1 });

    res.json({
      clubs,
      total: clubs.length
    });
  } catch (error) {
    console.error("Fetch clubs error:", error);
    res.status(500).json({ message: "Unable to fetch clubs" });
  }
});

// Get clubs followed by the logged-in student
router.get("/my-clubs", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id)
      .populate({
        path: "followedClubs",
        match: { isActive: true }
      })
      .select("followedClubs");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      clubs: student.followedClubs,
      total: student.followedClubs.length
    });
  } catch (error) {
    console.error("Fetch followed clubs error:", error);
    res.status(500).json({ message: "Unable to fetch your clubs" });
  }
});

// Get clubs administered by the logged-in student
router.get("/my-admin-clubs", auth, async (req, res) => {
  try {
    const clubs = await Club.find({
      admins: req.student.id,
      isActive: true
    }).sort({ name: 1 });

    res.json({
      clubs,
      total: clubs.length
    });
  } catch (error) {
    console.error("Fetch admin clubs error:", error);
    res.status(500).json({ message: "Unable to fetch your administered clubs" });
  }
});

// Follow a club
router.post("/:id/follow", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid club ID" });
    }

    const club = await Club.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const student = await Student.findById(req.student.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const alreadyFollowing = student.followedClubs.some(
      id => id.toString() === club._id.toString()
    );

    if (alreadyFollowing) {
      return res.status(409).json({ message: "You already follow this club" });
    }

    student.followedClubs.push(club._id);
    await student.save();

    res.json({
      message: "Club followed successfully",
      club
    });
  } catch (error) {
    console.error("Follow club error:", error);
    res.status(500).json({ message: "Unable to follow club" });
  }
});

// Unfollow a club
router.delete("/:id/follow", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid club ID" });
    }

    const student = await Student.findById(req.student.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const wasFollowing = student.followedClubs.some(
      id => id.toString() === req.params.id
    );

    if (!wasFollowing) {
      return res.status(404).json({ message: "You do not follow this club" });
    }

    student.followedClubs = student.followedClubs.filter(
      id => id.toString() !== req.params.id
    );

    await student.save();

    res.json({ message: "Club unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow club error:", error);
    res.status(500).json({ message: "Unable to unfollow club" });
  }
});

module.exports = router;
