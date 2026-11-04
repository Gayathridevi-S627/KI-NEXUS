require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const clubRoutes = require("./routes/clubs");
const eventRoutes = require("./routes/events");
const apiRoutes = require("./routes/api");
const clubMemberRoutes = require("./routes/clubMembers");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection cache
let mongoConnectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_DB_URI) {
    throw new Error("MONGO_DB_URI is missing");
  }

  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error("JWT_SECRET must contain at least 32 characters");
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGO_DB_URI)
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
}

// Connect MongoDB before API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("KI Nexus API is running");
});

app.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "Server is working"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/club-members", clubMemberRoutes);
app.use("/api", apiRoutes);

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`KI Nexus server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;