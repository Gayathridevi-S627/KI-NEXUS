
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");
const clubAdmin = require("../middleware/clubAdmin");

// GET active announcements for a club
router.get("/club/:clubId", auth, async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({ message: "Invalid club ID" });
    }

    const announcements = await Announcement.find({
      club: clubId,
      isActive: true
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ announcements });
  } catch (error) {
    console.error("Retrieve announcements error:", error);
    res.status(500).json({
      message: "Could not retrieve announcements"
    });
  }
});

// CREATE an announcement
router.post("/club/:clubId", auth, clubAdmin, async (req, res) => {
  try {
    const { title, message } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Title and message are required"
      });
    }

    if (title.trim().length > 150 || message.trim().length > 2000) {
      return res.status(400).json({
        message: "Title must be 150 characters or fewer and message 2000 or fewer"
      });
    }

    const announcement = await Announcement.create({
      club: req.club._id,
      createdBy: req.clubAdmin._id,
      title: title.trim(),
      message: message.trim()
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      message: "Could not create announcement"
    });
  }
});

// UPDATE an announcement
router.put("/:id/club/:clubId", auth, clubAdmin, async (req, res) => {
  try {
    const { id, clubId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        message: "Invalid announcement or club ID"
      });
    }

    const { title, message } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Title and message are required"
      });
    }

    if (title.trim().length > 150 || message.trim().length > 2000) {
      return res.status(400).json({
        message: "Title must be 150 characters or fewer and message 2000 or fewer"
      });
    }

    const announcement = await Announcement.findOneAndUpdate(
      {
        _id: id,
        club: req.club._id,
        isActive: true
      },
      {
        title: title.trim(),
        message: message.trim()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found"
      });
    }

    res.json({
      message: "Announcement updated successfully",
      announcement
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      message: "Could not update announcement"
    });
  }
});

// DELETE an announcement (soft delete)
router.delete("/:id/club/:clubId", auth, clubAdmin, async (req, res) => {
  try {
    const { id, clubId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        message: "Invalid announcement or club ID"
      });
    }

    const announcement = await Announcement.findOneAndUpdate(
      {
        _id: id,
        club: req.club._id,
        isActive: true
      },
      {
        isActive: false
      },
      {
        new: true
      }
    );

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found"
      });
    }

    res.json({
      message: "Announcement deleted successfully"
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      message: "Could not delete announcement"
    });
  }
});

module.exports = router;
