
require("dotenv").config();

const mongoose = require("mongoose");
const Club = require("../models/Club");

const clubs = [
  {
    name: "Agam Forum",
    category: "Wellness",
    description: "A community promoting yoga, wellness, mindfulness and a balanced lifestyle.",
    about: "Agam Forum encourages students to develop a healthy connection between body, mind and spirit through yoga and wellness activities.",
    initials: "AF",
    color: "#e9e4ff",
    textColor: "#6952b5",
    activities: ["Yoga sessions", "Wellness challenges", "Meditation workshops"],
    meeting: "Weekly sessions",
    location: "Campus"
  },
  {
    name: "AI Club",
    category: "Technology",
    description: "Explore artificial intelligence, machine learning and emerging technologies.",
    about: "A student community interested in learning and experimenting with artificial intelligence and machine learning.",
    initials: "AI",
    color: "#dcecff",
    textColor: "#2867a9",
    activities: ["AI workshops", "Technical sessions", "Project discussions"],
    meeting: "Weekly sessions",
    location: "Campus"
  },
  {
    name: "Rotaract Club",
    category: "Social Service",
    description: "Build leadership skills while creating a positive impact in society.",
    about: "Rotaract provides opportunities for students to develop leadership, professional skills and community service.",
    initials: "RC",
    color: "#ffe6e2",
    textColor: "#bd594b",
    activities: ["Community service", "Fundraising", "Awareness campaigns"],
    meeting: "Monthly activities",
    location: "Campus"
  },
  {
    name: "CodeKCT",
    category: "Technology",
    description: "Connect with developers, solve problems and build technology projects.",
    about: "A coding-focused student community that encourages programming practice, collaboration and software development.",
    initials: "CK",
    color: "#dcf4e9",
    textColor: "#27815b",
    activities: ["Coding contests", "Hackathons", "Peer learning"],
    meeting: "Regular coding sessions",
    location: "Campus"
  },
  {
    name: "Cyber Shield",
    category: "Technology",
    description: "Learn about cybersecurity, ethical hacking and digital safety.",
    about: "A community for students interested in cybersecurity, digital safety and ethical security practices.",
    initials: "CS",
    color: "#e1e8ff",
    textColor: "#4d61a8",
    activities: ["Security workshops", "CTF challenges", "Cyber awareness"],
    meeting: "Regular sessions",
    location: "Campus"
  },
  {
    name: "Robotics Club",
    category: "Technology",
    description: "Turn ideas into working machines through robotics and innovation.",
    about: "Students collaborate to explore robotics, automation, electronics and hands-on engineering projects.",
    initials: "RB",
    color: "#fff0d9",
    textColor: "#a36b24",
    activities: ["Robotics projects", "Hardware workshops", "Competitions"],
    meeting: "Project-based sessions",
    location: "Campus"
  },
  {
    name: "GDSC KCT",
    category: "Technology",
    description: "Learn, build and grow through developer-focused activities.",
    about: "A developer community focused on collaborative learning and practical technology exploration.",
    initials: "GD",
    color: "#e0f0ff",
    textColor: "#3478ad",
    activities: ["Developer workshops", "Study jams", "Project building"],
    meeting: "Community sessions",
    location: "Campus"
  },
  {
    name: "Fine Arts Club",
    category: "Arts & Culture",
    description: "Express creativity through art, design, music and cultural activities.",
    about: "A creative space for students to express themselves and explore different forms of art and culture.",
    initials: "FA",
    color: "#ffe5ef",
    textColor: "#b54d79",
    activities: ["Art events", "Creative workshops", "Cultural programs"],
    meeting: "Event-based sessions",
    location: "Campus"
  },
  {
    name: "E-Cell",
    category: "Entrepreneurship",
    description: "Explore entrepreneurship, startups, innovation and business ideas.",
    about: "A student community that encourages entrepreneurial thinking, innovation and startup exploration.",
    initials: "EC",
    color: "#e5f1e3",
    textColor: "#54834e",
    activities: ["Startup talks", "Ideathons", "Entrepreneurship workshops"],
    meeting: "Regular activities",
    location: "Campus"
  },
  {
    name: "Tamil Mandram",
    category: "Arts & Culture",
    description: "Celebrate Tamil language, literature, culture and traditions.",
    about: "A platform for students to appreciate and celebrate Tamil language, literature and culture.",
    initials: "TM",
    color: "#fff0dc",
    textColor: "#a66c32",
    activities: ["Literary events", "Cultural programs", "Tamil celebrations"],
    meeting: "Event-based sessions",
    location: "Campus"
  },
  {
    name: "Sports Forum",
    category: "Sports",
    description: "Encourage fitness, teamwork and participation in sports.",
    about: "A community that promotes sports participation, physical fitness and teamwork among students.",
    initials: "SF",
    color: "#e0f2ed",
    textColor: "#397d68",
    activities: ["Sports events", "Team practice", "Fitness activities"],
    meeting: "Regular practice",
    location: "Sports grounds"
  }
];

async function seedClubs() {
  try {
    if (!process.env.MONGO_DB_URI) {
      throw new Error("MONGO_DB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_DB_URI);

    console.log("Connected to MongoDB");

    const operations = clubs.map(club => ({
      updateOne: {
        filter: { name: club.name },
        update: {
          $set: {
            ...club,
            isActive: true
          }
        },
        upsert: true
      }
    }));

    const result = await Club.bulkWrite(operations);

    console.log("Club initialization completed");
    console.log(`New clubs: ${result.upsertedCount}`);
    console.log(`Updated clubs: ${result.modifiedCount}`);

    const total = await Club.countDocuments({ isActive: true });
    console.log(`Total active clubs in database: ${total}`);
  } catch (error) {
    console.error("Club initialization failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedClubs();
