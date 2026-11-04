const mongoose = require("mongoose");
const Student = require("../models/Student");
const Club = require("../models/Club");

async function clubAdmin(req, res, next) {
  try {
    if (!req.student || !req.student.id) {
      return res.status(401).json({
        success: false,
        message: "Please log in first"
      });
    }

    const clubId = req.params.clubId || req.body.clubId;

    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID"
      });
    }

    const student = await Student.findById(req.student.id);

    if (!student || student.role !== "clubAdmin") {
      return res.status(403).json({
        success: false,
        message: "Club administrator access required"
      });
    }

    const club = await Club.findOne({
      _id: clubId,
      admins: student._id,
      isActive: true
    });

    if (!club) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this club"
      });
    }

    req.club = club;
    req.clubAdmin = student;

    next();

  } catch (error) {
    console.error("Club admin authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify club administrator"
    });
  }
}

module.exports = clubAdmin;