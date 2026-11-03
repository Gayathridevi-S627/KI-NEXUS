
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const auth = require("../middleware/auth");

const router = express.Router();

function studentResponse(student) {
  return {
    id: student._id,
    name: student.name,
    email: student.email,
    rollNumber: student.rollNumber,
    bio: student.bio,
    department: student.department,
    academicYear: student.academicYear,
    interests: student.interests,
    role: student.role || "student",
    managedClubs: student.managedClubs || [],
    createdAt: student.createdAt
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, rollNumber, password } = req.body;

    if (!name || !email || !rollNumber || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    const existingStudent = await Student.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { rollNumber: rollNumber.toUpperCase().trim() }
      ]
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email or roll number is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      rollNumber: rollNumber.toUpperCase().trim(),
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      student: studentResponse(student)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or roll number is already registered"
      });
    }

    console.error("Registration error:", error.message);
    res.status(500).json({
      message: "Registration failed"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const student = await Student.findOne({
      email: email.toLowerCase().trim()
    });

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: student._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      student: studentResponse(student)
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Login failed"
    });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      student: studentResponse(student)
    });
  } catch (error) {
    console.error("Get student error:", error.message);
    res.status(500).json({
      message: "Could not retrieve student"
    });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio, department, academicYear, interests } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Name cannot exceed 100 characters"
      });
    }

    if (typeof bio !== "string" || bio.length > 300) {
      return res.status(400).json({
        message: "Bio must be a string of up to 300 characters"
      });
    }

    if (typeof department !== "string" || department.length > 100) {
      return res.status(400).json({
        message: "Enter a valid department"
      });
    }

    if (typeof academicYear !== "string") {
      return res.status(400).json({
        message: "Enter a valid academic year"
      });
    }

    if (!Array.isArray(interests) ||
        !interests.every(item => typeof item === "string" && item.trim()) ||
        interests.length > 15) {
      return res.status(400).json({
        message: "Enter up to 15 valid interests"
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.student.id,
      {
        $set: {
          name: name.trim(),
          bio: bio.trim(),
          department: department.trim(),
          academicYear: academicYear.trim(),
          interests: [...new Set(interests.map(item => item.trim()))]
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Profile updated successfully",
      student: studentResponse(student)
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({
      message: "Could not update profile"
    });
  }
});

module.exports = router;
