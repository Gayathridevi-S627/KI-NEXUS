
require("dotenv").config();

const mongoose = require("mongoose");
const Club = require("./models/Club");

const categoryMapping = {
  "Fine Arts Club": "Fine Arts",
  "Tamil Mandram": "Literature",
  "E-Cell": "Leadership",
  "Agam Forum": "Fitness",
  "Rotaract Club": "Community",
  "Sports Forum": "Kumaraguru Sports",
  "Robotics Club": "Technical",
  "AI Club": "Technical",
  "CodeKCT": "Technical",
  "Cyber Shield": "Technical",
  "GDSC KCT": "Technical"
};

async function updateClubCategories() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);

    console.log("MongoDB connected");

    for (const [name, category] of Object.entries(categoryMapping)) {
      const result = await Club.updateOne(
        { name },
        { $set: { category } }
      );

      console.log(
        result.matchedCount
          ? `Updated: ${name} -> ${category}`
          : `Not found: ${name}`
      );
    }

    console.log("\nUpdated clubs:");

    const clubs = await Club.find({ isActive: true })
      .select("name category")
      .sort({ category: 1, name: 1 });

    console.table(
      clubs.map(club => ({
        Club: club.name,
        Vertical: club.category
      }))
    );

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

updateClubCategories();
