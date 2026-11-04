const express = require("express");

const Student = require("../models/Student");
const auth = require("../middleware/auth");
const clubAdmin = require("../middleware/clubAdmin");

const router = express.Router();

// GET all followers of a club
router.get("/:clubId", auth, clubAdmin, async (req, res) => {
  try {
    const { search = "" } = req.query;

    const filter = {
      followedClubs: req.club._id
    };

    if (search.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { rollNumber: { $regex: safeSearch, $options: "i" } },
        { department: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const members = await Student.find(filter)
      .select("name email rollNumber department academicYear bio")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      club: req.club.name,
      total: members.length,
      members
    });

  } catch (error) {
    console.error("Fetch club members error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch club members"
    });
  }
});

// GET total followers count
router.get("/:clubId/count", auth, clubAdmin, async (req, res) => {
  try {
    const total = await Student.countDocuments({
      followedClubs: req.club._id
    });

    res.status(200).json({
      success: true,
      total
    });

  } catch (error) {
    console.error("Member count error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch member count"
    });
  }
});

module.exports = router;