require("dotenv").config();

const mongoose = require("mongoose");
const Club = require("./models/Club");

const verticals = {
  "Fine Arts": [
    "PixelD",
    "Nigal",
    "StudioKCT",
  ],
  "Performing Arts": [
    "Dance Club",
    "Music Club",
    "Drama Troupe",
  ],
  Community: [
    "Nature Club",
    "Able Club",
  ],
  "Kumaraguru Sports": [],
  Literature: [
    "Kural",
    "Qubate",
    "Books and Beyond",
  ],
  Technical: [
    "HAM Club",
    "Aeromodelling Club",
    "Robotics Club",
  ],
  "National Organisation": [
    "NCC",
    "NSS",
  ],
  Fitness: [
    "Runner Club",
    "Agam Forum",
    "Bikers Club",
  ],
  Leadership: [
    "CLED",
  ],
};

async function replaceClubs() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, {
      dbName: "db_457sre9xc",
    });

    console.log("Connected to MongoDB");

    // Keep the existing Agam Forum document and its admin assignment.
    const agamForum = await Club.findOne({ name: "Agam Forum" });

    if (!agamForum) {
      throw new Error(
        "Agam Forum was not found. No clubs were deleted."
      );
    }

    // Remove all other existing club records.
    await Club.deleteMany({
      _id: { $ne: agamForum._id },
    });

    // Update Agam Forum without changing its _id or admins.
    agamForum.category = "Fitness";
    agamForum.isActive = true;
    await agamForum.save();

    // Create every other club in the supplied list.
    const newClubs = [];

    for (const [category, names] of Object.entries(verticals)) {
      for (const name of names) {
        if (name === "Agam Forum") continue;

        newClubs.push({
          name,
          category,
          description: `${name} at KCT`,
          initials: name
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 3)
            .toUpperCase(),
          isActive: true,
          admins: [],
        });
      }
    }

    await Club.insertMany(newClubs);

    console.log("Club replacement completed!");
    console.log("Preserved Agam Forum ID:", agamForum._id);
    console.log("Preserved Agam Forum admins:", agamForum.admins);
    console.log("New clubs created:", newClubs.length);
    console.log("Total clubs:", newClubs.length + 1);
  } catch (error) {
    console.error("Club replacement failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

replaceClubs();