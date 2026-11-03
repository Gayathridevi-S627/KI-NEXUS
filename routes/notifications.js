
const express = require("express");
const mongoose = require("mongoose");

const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

// =====================================
// GET ALL NOTIFICATIONS
// =====================================

router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.student.id
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipient: req.student.id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount,
      totalCount: notifications.length
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);

    res.status(500).json({
      message: "Unable to fetch notifications"
    });
  }
});

// =====================================
// MARK ONE NOTIFICATION AS READ
// =====================================

router.patch("/:id/read", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid notification ID"
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.student.id
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    res.status(500).json({
      message: "Unable to update notification"
    });
  }
});

// =====================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================

router.patch("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.student.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    res.status(500).json({
      message: "Unable to update notifications"
    });
  }
});

module.exports = router;
