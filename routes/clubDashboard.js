
const express = require("express");
const Student = require("../models/Student");
const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");
const clubAdmin = require("../middleware/clubAdmin");

const router = express.Router();

router.get("/:clubId", auth, clubAdmin, async (req, res) => {
  try {
    const clubId = req.club._id;

    const [
      followers,
      totalEvents,
      totalAnnouncements,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      cancelledEvents,
    ] = await Promise.all([
      Student.countDocuments({ followedClubs: clubId }),
      Event.countDocuments({ club: clubId }),
      Announcement.countDocuments({ club: clubId, isActive: true }),
      Event.countDocuments({
        club: clubId,
        status: "Upcoming",
      }),
      Event.countDocuments({
        club: clubId,
        status: "Ongoing",
      }),
      Event.countDocuments({
        club: clubId,
        status: "Completed",
      }),
      Event.countDocuments({
        club: clubId,
        status: "Cancelled",
      }),
    ]);

    res.json({
      success: true,
      club: req.club.name,
      statistics: {
        followers,
        totalEvents,
        totalAnnouncements,
        upcomingEvents,
        ongoingEvents,
        completedEvents,
        cancelledEvents,
      },
    });
  } catch (error) {
    console.error("Club analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load club analytics",
    });
  }
});

module.exports = router;
