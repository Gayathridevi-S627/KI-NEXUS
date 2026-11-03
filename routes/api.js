
const express = require("express");

const Todo = require("../models/todo");
const Event = require("../models/Event");

const auth = require("../middleware/auth");

const announcementRoutes = require("./announcements");
const clubDashboardRoutes = require("./clubDashboard");
const clubMembersRoutes = require("./clubMembers");
const notificationRoutes = require("./notifications");

const router = express.Router();

// Escape special characters in search input
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// =====================================
// TODO ROUTES
// =====================================

// Get todos
router.get("/todos", auth, async (req, res) => {
  try {
    const todos = await Todo.find({
      student: req.student.id
    }).sort({ createdAt: -1 });

    res.json(todos);
  } catch (error) {
    console.error("Fetch todos error:", error);

    res.status(500).json({
      message: "Unable to fetch todos"
    });
  }
});

// Create todo
router.post("/todos", auth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Todo title is required"
      });
    }

    const todo = await Todo.create({
      title: title.trim(),
      student: req.student.id
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error("Create todo error:", error);

    res.status(500).json({
      message: "Unable to create todo"
    });
  }
});

// Delete todo
router.delete("/todos/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      student: req.student.id
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.json({
      message: "Todo deleted successfully"
    });
  } catch (error) {
    console.error("Delete todo error:", error);

    res.status(500).json({
      message: "Unable to delete todo"
    });
  }
});

// =====================================
// EVENT ROUTES
// =====================================

// Get events
router.get("/events", async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {
      eventDate: { $gte: new Date() },
      status: { $in: ["Upcoming", "Ongoing"] }
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { venue: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const events = await Event.find(filter)
      .populate("club", "name initials color")
      .sort({ eventDate: 1 });

    res.json(events);
  } catch (error) {
    console.error("Fetch events error:", error);

    res.status(500).json({
      message: "Unable to fetch events"
    });
  }
});

// Get single event
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("club", "name initials color");

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Fetch event error:", error);

    res.status(500).json({
      message: "Unable to fetch event"
    });
  }
});

// =====================================
// ANNOUNCEMENT ROUTES
// =====================================

router.use("/announcements", announcementRoutes);

// =====================================
// CLUB DASHBOARD ROUTES
// =====================================

router.use("/club-dashboard", clubDashboardRoutes);

// =====================================
// CLUB MEMBER ROUTES
// =====================================

router.use("/club-members", clubMembersRoutes);

// =====================================
// NOTIFICATION ROUTES
// =====================================

router.use("/notifications", notificationRoutes);

module.exports = router;
