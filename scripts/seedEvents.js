
require("dotenv").config();

const mongoose = require("mongoose");
const Event = require("../models/Event");

const sampleEvents = [
  {
    title: "AI and Machine Learning Workshop",
    category: "Technology",
    description: "An introductory workshop exploring artificial intelligence, machine learning concepts and practical applications.",
    eventDate: new Date("2026-11-05T10:00:00+05:30"),
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    venue: "Innovation Lab",
    organizer: {
      name: "AI Club",
      initials: "AI"
    },
    status: "Upcoming"
  },
  {
    title: "Campus Yoga and Wellness Session",
    category: "Wellness",
    description: "A guided yoga and mindfulness session focusing on flexibility, breathing and overall well-being.",
    eventDate: new Date("2026-11-07T06:00:00+05:30"),
    startTime: "06:00 AM",
    endTime: "07:00 AM",
    venue: "Yoga Hall",
    organizer: {
      name: "Agam Forum",
      initials: "AF"
    },
    status: "Upcoming"
  },
  {
    title: "Inter-Department Sports Meet",
    category: "Sports",
    description: "A campus sports event featuring team competitions and individual sporting activities.",
    eventDate: new Date("2026-11-12T09:00:00+05:30"),
    startTime: "09:00 AM",
    endTime: "04:00 PM",
    venue: "College Sports Ground",
    organizer: {
      name: "Sports Forum",
      initials: "SF"
    },
    status: "Upcoming"
  },
  {
    title: "Creative Arts Exhibition",
    category: "Arts & Culture",
    description: "Explore student artwork, creative displays and artistic expressions from different departments.",
    eventDate: new Date("2026-11-15T11:00:00+05:30"),
    startTime: "11:00 AM",
    endTime: "03:00 PM",
    venue: "Main Auditorium",
    organizer: {
      name: "Fine Arts Club",
      initials: "FA"
    },
    status: "Upcoming"
  },
  {
    title: "Community Outreach Initiative",
    category: "Social Service",
    description: "A community engagement initiative encouraging students to participate in social responsibility activities.",
    eventDate: new Date("2026-11-18T09:00:00+05:30"),
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    venue: "Community Centre",
    organizer: {
      name: "Rotaract Club",
      initials: "RC"
    },
    status: "Upcoming"
  },
  {
    title: "Startup Ideas and Innovation Meetup",
    category: "Entrepreneurship",
    description: "A meetup for students to discuss startup ideas, innovation and entrepreneurial opportunities.",
    eventDate: new Date("2026-11-21T10:00:00+05:30"),
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    venue: "Seminar Hall",
    organizer: {
      name: "E-Cell",
      initials: "EC"
    },
    status: "Upcoming"
  }
];

async function seedEvents() {
  try {
    if (!process.env.MONGO_DB_URI) {
      throw new Error("MONGO_DB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_DB_URI);

    console.log("MongoDB connected successfully");

    const operations = sampleEvents.map(event => ({
      updateOne: {
        filter: { title: event.title },
        update: { $set: event },
        upsert: true
      }
    }));

    const result = await Event.bulkWrite(operations);

    console.log("Event seeding completed");
    console.log("Inserted:", result.upsertedCount);
    console.log("Updated:", result.modifiedCount);
    console.log("Matched:", result.matchedCount);

  } catch (error) {
    console.error("Event seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedEvents();
