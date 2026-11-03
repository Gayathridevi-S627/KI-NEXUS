
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  rollNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  bio: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ""
  },

  department: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ""
  },

  academicYear: {
    type: String,
    trim: true,
    default: ""
  },

  interests: {
    type: [String],
    default: []
  },

  followedClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club"
  }],

  role: {
    type: String,
    enum: ["student", "clubAdmin"],
    default: "student"
  },

  managedClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club"
  }]

}, {
  timestamps: true
});

module.exports =
  mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);
