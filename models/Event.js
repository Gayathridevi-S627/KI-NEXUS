
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    eventDate: {
      type: Date,
      required: true
    },

    startTime: {
      type: String,
      required: true
    },

    endTime: {
      type: String,
      required: true
    },

    venue: {
      type: String,
      required: true,
      trim: true
    },

    organizer: {
      name: {
        type: String,
        required: true
      },
      initials: {
        type: String,
        default: "CA"
      }
    },

    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming"
    }
  },
  {
    timestamps: true
  }
);

EventSchema.index({ club: 1, eventDate: 1 });

module.exports =
  mongoose.models.Event ||
  mongoose.model("Event", EventSchema);
