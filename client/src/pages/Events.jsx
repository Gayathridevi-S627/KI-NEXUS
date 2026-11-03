import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  X,
  RefreshCw,
  CalendarCheck,
  Music,
} from "lucide-react";

import "./Events.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const statuses = [
  "All",
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
];

function formatDate(date) {
  if (!date) return "Date not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDay(date) {
  if (!date) return "--";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
  });
}

function formatMonth(date) {
  if (!date) return "---";

  return new Date(date)
    .toLocaleDateString("en-IN", { month: "short" })
    .toUpperCase();
}

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load events");
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        events
          .map((event) => event.category)
          .filter(Boolean)
      ),
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return events.filter((event) => {
      const matchesStatus =
        activeStatus === "All" ||
        event.status === activeStatus;

      const matchesCategory =
        activeCategory === "All" ||
        event.category === activeCategory;

      const matchesSearch =
        !searchText ||
        event.title?.toLowerCase().includes(searchText) ||
        event.description?.toLowerCase().includes(searchText) ||
        event.category?.toLowerCase().includes(searchText) ||
        event.venue?.toLowerCase().includes(searchText) ||
        event.club?.name?.toLowerCase().includes(searchText) ||
        event.organizer?.name?.toLowerCase().includes(searchText);

      return (
        matchesStatus &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [events, search, activeStatus, activeCategory]);

  const upcomingCount = events.filter(
    (event) => event.status === "Upcoming"
  ).length;

  const ongoingCount = events.filter(
    (event) => event.status === "Ongoing"
  ).length;

  const completedCount = events.filter(
    (event) => event.status === "Completed"
  ).length;

  const renderEventCard = (event) => (
    <article className="event-card" key={event._id}>
      <div className="event-card-date">
        <strong>{formatDay(event.eventDate)}</strong>
        <span>{formatMonth(event.eventDate)}</span>
      </div>

      <div className="event-card-content">
        <div className="event-card-top">
          <span className="event-category">
            {event.category}
          </span>

          <span
            className={`event-status ${(
              event.status || "Upcoming"
            ).toLowerCase()}`}
          >
            {event.status || "Upcoming"}
          </span>
        </div>

        <h3>{event.title}</h3>

        <p className="event-description">
          {event.description}
        </p>

        <div className="event-details">
          <span>
            <CalendarDays size={14} />
            {formatDate(event.eventDate)}
          </span>

          <span>
            <Clock size={14} />
            {event.startTime} – {event.endTime}
          </span>

          <span>
            <MapPin size={14} />
            {event.venue}
          </span>
        </div>

        <div className="event-card-footer">
          <div className="event-organizer">
            <div className="event-organizer-avatar">
              {event.organizer?.initials || "CA"}
            </div>

            <div>
              <span className="event-footer-label">
                Organized by
              </span>

              <strong>
                {event.organizer?.name || "Club Admin"}
              </strong>
            </div>
          </div>

          <div className="event-club">
            {event.club?.name || "KCT Community"}
          </div>
        </div>

        <button
          className="event-view-button"
          onClick={() => setSelectedEvent(event)}
        >
          View Details
        </button>
      </div>
    </article>
  );

  return (
    <div className="events-page">
      {/* Page heading */}
      <section className="events-heading">
        <div>
          <span className="events-eyebrow">
            <CalendarCheck size={14} />
            CAMPUS HAPPENINGS
          </span>

          <h1>Events at KCT</h1>

          <p>
            Discover upcoming events, activities and
            experiences happening across your campus.
          </p>
        </div>

        <div className="events-heading-icon">
          <CalendarDays size={30} />
        </div>
      </section>

      {/* Statistics */}
      <section className="events-stats">
        <div className="event-stat-card">
          <div className="event-stat-icon purple">
            <CalendarDays size={21} />
          </div>

          <div>
            <strong>{events.length}</strong>
            <span>Total Events</span>
          </div>
        </div>

        <div className="event-stat-card">
          <div className="event-stat-icon blue">
            <Clock size={21} />
          </div>

          <div>
            <strong>{upcomingCount}</strong>
            <span>Upcoming</span>
          </div>
        </div>

        <div className="event-stat-card">
          <div className="event-stat-icon green">
            <Music size={21} />
          </div>

          <div>
            <strong>{ongoingCount}</strong>
            <span>Ongoing</span>
          </div>
        </div>

        <div className="event-stat-card">
          <div className="event-stat-icon orange">
            <CalendarCheck size={21} />
          </div>

          <div>
            <strong>{completedCount}</strong>
            <span>Completed</span>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="events-search">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search events, clubs, venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Status filters */}
      <div className="events-filter-section">
        <h3>Event Status</h3>

        <div className="events-filter-list">
          {statuses.map((status) => (
            <button
              key={status}
              className={`events-filter-chip ${
                activeStatus === status ? "active" : ""
              }`}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Category filters */}
      <div className="events-filter-section">
        <h3>Categories</h3>

        <div className="events-filter-list">
          {categories.map((category) => (
            <button
              key={category}
              className={`events-filter-chip ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Event results */}
      <div className="events-results-heading">
        <div>
          <h2>Discover Events</h2>
          <p>
            Find something exciting happening at KCT.
          </p>
        </div>

        <span>
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "event" : "events"} found
        </span>
      </div>

      {loading ? (
        <div className="events-empty">
          <RefreshCw size={30} className="events-loading-icon" />
          <h3>Loading events...</h3>
          <p>Please wait while we fetch campus events.</p>
        </div>
      ) : error ? (
        <div className="events-empty">
          <CalendarDays size={30} />
          <h3>Unable to load events</h3>
          <p>{error}</p>

          <button
            className="events-retry-button"
            onClick={fetchEvents}
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="events-empty">
          <CalendarDays size={32} />
          <h3>No events found</h3>

          <p>
            There are no events matching your current filters.
          </p>

          <button
            className="events-retry-button"
            onClick={() => {
              setSearch("");
              setActiveStatus("All");
              setActiveCategory("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(renderEventCard)}
        </div>
      )}

      {/* Event details modal */}
      {selectedEvent && (
        <div
          className="event-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="event-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="event-modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close event details"
            >
              <X size={20} />
            </button>

            <span className="event-category">
              {selectedEvent.category}
            </span>

            <h2>{selectedEvent.title}</h2>

            <span
              className={`event-status ${(
                selectedEvent.status || "Upcoming"
              ).toLowerCase()}`}
            >
              {selectedEvent.status || "Upcoming"}
            </span>

            <div className="event-modal-section">
              <h3>About this Event</h3>
              <p>{selectedEvent.description}</p>
            </div>

            <div className="event-modal-info">
              <div>
                <CalendarDays size={18} />
                <span>
                  <small>Date</small>
                  <strong>
                    {formatDate(selectedEvent.eventDate)}
                  </strong>
                </span>
              </div>

              <div>
                <Clock size={18} />
                <span>
                  <small>Time</small>
                  <strong>
                    {selectedEvent.startTime} –{" "}
                    {selectedEvent.endTime}
                  </strong>
                </span>
              </div>

              <div>
                <MapPin size={18} />
                <span>
                  <small>Venue</small>
                  <strong>{selectedEvent.venue}</strong>
                </span>
              </div>

              <div>
                <Users size={18} />
                <span>
                  <small>Organized by</small>
                  <strong>
                    {selectedEvent.organizer?.name || "Club Admin"}
                  </strong>
                </span>
              </div>
            </div>

            <div className="event-modal-club">
              <span>Organizing Club</span>
              <strong>
                {selectedEvent.club?.name || "KCT Community"}
              </strong>
            </div>

            <button
              className="event-modal-done"
              onClick={() => setSelectedEvent(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;