
const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

AnnouncementSchema.index({
  club: 1,
  createdAt: -1
});

module.exports =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);
