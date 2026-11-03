
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Event = require("../models/Event");
const auth = require("../middleware/auth");
const clubAdmin = require("../middleware/clubAdmin");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET ALL EVENTS
// GET /api/events
router.get("/", async (req, res) => {
  try {
    const { search, category, status } = req.query;

    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { venue: regex }
      ];
    }

    const events = await Event.find(filter)
      .populate("club", "name image initials color")
      .sort({ eventDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch events"
    });
  }
});


// GET EVENTS FOR ONE CLUB
// GET /api/events/club/:clubId
router.get("/club/:clubId", async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID"
      });
    }

    const events = await Event.find({
      club: clubId
    })
      .populate("club", "name image initials color")
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error("Get club events error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch club events"
    });
  }
});


// CREATE EVENT
// POST /api/events/club/:clubId
router.post(
  "/club/:clubId",
  auth,
  clubAdmin,
  async (req, res) => {
    try {
      const {
        title,
        category,
        description,
        eventDate,
        startTime,
        endTime,
        venue,
        status
      } = req.body;

      if (
        !title ||
        !category ||
        !description ||
        !eventDate ||
        !startTime ||
        !endTime ||
        !venue
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required event details"
        });
      }

      const event = await Event.create({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        eventDate,
        startTime,
        endTime,
        venue: venue.trim(),
        status: status || "Upcoming",
        club: req.club._id,
        organizer: {
          name: req.clubAdmin.name,
          initials: (req.clubAdmin.name || "CA")
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        }
      });

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event
      });
    } catch (error) {
      console.error("Create event error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to create event"
      });
    }
  }
);


// GET ONE EVENT
// GET /api/events/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
    }

    const event = await Event.findById(id)
      .populate("club", "name image initials color");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error("Get event details error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch event details"
    });
  }
});


// UPDATE EVENT
// PUT /api/events/:id/club/:clubId
router.put(
  "/:id/club/:clubId",
  auth,
  clubAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID"
        });
      }

      const event = await Event.findOne({
        _id: id,
        club: req.club._id
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found for this club"
        });
      }

      const allowedFields = [
        "title",
        "category",
        "description",
        "eventDate",
        "startTime",
        "endTime",
        "venue",
        "status"
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          event[field] = req.body[field];
        }
      });

      await event.save();

      res.status(200).json({
        success: true,
        message: "Event updated successfully",
        event
      });
    } catch (error) {
      console.error("Update event error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update event"
      });
    }
  }
);


// DELETE EVENT
// DELETE /api/events/:id/club/:clubId
router.delete(
  "/:id/club/:clubId",
  auth,
  clubAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID"
        });
      }

      const event = await Event.findOneAndDelete({
        _id: id,
        club: req.club._id
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found for this club"
        });
      }

      res.status(200).json({
        success: true,
        message: "Event deleted successfully"
      });
    } catch (error) {
      console.error("Delete event error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to delete event"
      });
    }
  }
);

module.exports = router;
