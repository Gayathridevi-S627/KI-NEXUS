
const mongoose = require("mongoose");

const CLUB_VERTICALS = [
  "Fine Arts",
  "Performing Arts",
  "Community",
  "Kumaraguru Sports",
  "Literature",
  "Technical",
  "National Organisation",
  "Fitness",
  "Leadership"
];

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },

  category: {
    type: String,
    required: true,
    trim: true,
    enum: CLUB_VERTICALS
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  about: {
    type: String,
    default: "",
    trim: true
  },

  image: {
    type: String,
    default: ""
  },

  initials: {
    type: String,
    default: ""
  },

  color: {
    type: String,
    default: "#e9e4ff"
  },

  textColor: {
    type: String,
    default: "#6952b5"
  },

  activities: {
    type: [String],
    default: []
  },

  meeting: {
    type: String,
    default: ""
  },

  location: {
    type: String,
    default: ""
  },

  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports.CLUB_VERTICALS = CLUB_VERTICALS;

module.exports =
  mongoose.models.Club ||
  mongoose.model("Club", ClubSchema);
