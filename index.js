
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const clubRoutes = require("./routes/clubs");
const eventRoutes = require("./routes/events");
const apiRoutes = require("./routes/api");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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
app.use("/api", apiRoutes);

// Serve frontend build if available
const clientDistPath = path.join(__dirname, "client", "dist");

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Server configuration
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_DB_URI) {
      throw new Error("MONGO_DB_URI is missing in .env");
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error(
        "JWT_SECRET must contain at least 32 characters"
      );
    }

    await mongoose.connect(process.env.MONGO_DB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`KI Nexus server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
