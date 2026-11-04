import "./ClubAdmin.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Users, Search, Mail, GraduationCap } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";
const CHART_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

const EMPTY_EVENT = {
  title: "",
  category: "Workshop",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  venue: ""
};

const EMPTY_ANNOUNCEMENT = { title: "", message: "" };

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

function getDateInputValue(date) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

export default function ClubAdmin({ token }) {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [dashboard, setDashboard] = useState({});
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Followers
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [announcementForm, setAnnouncementForm] = useState(EMPTY_ANNOUNCEMENT);

  const [editingEvent, setEditingEvent] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadClubs = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/clubs/my-admin-clubs", token);
      const list = Array.isArray(data) ? data : data.clubs || [];

      setClubs(list);

      if (list.length) {
        setSelectedClub(current =>
          current && list.some(club => club._id === current)
            ? current
            : list[0]._id
        );
      } else {
        setSelectedClub("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadClubData = useCallback(async () => {
    if (!token || !selectedClub) return;

    setError("");
    setMembersError("");
    setMembersLoading(true);

    // Load followers independently so a follower API error
    // does not prevent events and announcements from loading.
    const membersPromise = apiRequest(
      `/club-members/${selectedClub}`,
      token
    )
      .then(data => {
        setMembers(data.members || []);
      })
      .catch(err => {
        setMembers([]);
        setMembersError(err.message);
      })
      .finally(() => {
        setMembersLoading(false);
      });

    try {
      const [dashboardData, eventData, announcementData] =
        await Promise.all([
          apiRequest(`/club-dashboard/${selectedClub}`, token),
          apiRequest(`/events/club/${selectedClub}`, token),
          apiRequest(`/announcements/club/${selectedClub}`, token)
        ]);

      setDashboard(dashboardData.statistics || {});

      setEvents(
        Array.isArray(eventData) ? eventData : eventData.events || []
      );

      setAnnouncements(
        Array.isArray(announcementData)
          ? announcementData
          : announcementData.announcements || []
      );
    } catch (err) {
      setError(err.message);
    }

    await membersPromise;
  }, [token, selectedClub]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

  const chartData = useMemo(() => [
    { name: "Upcoming", value: dashboard.upcomingEvents || 0 },
    { name: "Ongoing", value: dashboard.ongoingEvents || 0 },
    { name: "Completed", value: dashboard.completedEvents || 0 },
    { name: "Cancelled", value: dashboard.cancelledEvents || 0 }
  ].filter(item => item.value > 0), [dashboard]);

  const selectedClubName =
    clubs.find(club => club._id === selectedClub)?.name || "Club";

  const filteredMembers = members.filter(member => {
    const query = memberSearch.toLowerCase();

    return [
      member.name,
      member.email,
      member.rollNumber,
      member.department
    ].some(value => value?.toLowerCase().includes(query));
  });

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleEventSubmit = async e => {
    e.preventDefault();
    if (!selectedClub) return;

    try {
      setSaving(true);
      clearMessages();

      const path = editingEvent
        ? `/events/${editingEvent}/club/${selectedClub}`
        : `/events/club/${selectedClub}`;

      await apiRequest(path, token, {
        method: editingEvent ? "PUT" : "POST",
        body: JSON.stringify(eventForm)
      });

      setSuccess(editingEvent ? "Event updated successfully." : "Event created successfully.");
      setEventForm(EMPTY_EVENT);
      setEditingEvent(null);
      await loadClubData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditEvent = event => {
    clearMessages();
    setEditingEvent(event._id);

    setEventForm({
      title: event.title || "",
      category: event.category || "Workshop",
      description: event.description || "",
      eventDate: getDateInputValue(event.eventDate),
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      venue: event.venue || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEvent = async eventId => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      clearMessages();

      await apiRequest(
        `/events/${eventId}/club/${selectedClub}`,
        token,
        { method: "DELETE" }
      );

      setSuccess("Event deleted successfully.");
      await loadClubData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnnouncementSubmit = async e => {
    e.preventDefault();
    if (!selectedClub) return;

    try {
      setSaving(true);
      clearMessages();

      const path = editingAnnouncement
        ? `/announcements/${editingAnnouncement}/club/${selectedClub}`
        : `/announcements/club/${selectedClub}`;

      await apiRequest(path, token, {
        method: editingAnnouncement ? "PUT" : "POST",
        body: JSON.stringify(announcementForm)
      });

      setSuccess(
        editingAnnouncement
          ? "Announcement updated successfully."
          : "Announcement published successfully."
      );

      setAnnouncementForm(EMPTY_ANNOUNCEMENT);
      setEditingAnnouncement(null);
      await loadClubData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditAnnouncement = announcement => {
    clearMessages();
    setEditingAnnouncement(announcement._id);

    setAnnouncementForm({
      title: announcement.title || "",
      message: announcement.message || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAnnouncement = async announcementId => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      clearMessages();

      await apiRequest(
        `/announcements/${announcementId}/club/${selectedClub}`,
        token,
        { method: "DELETE" }
      );

      setSuccess("Announcement deleted successfully.");
      await loadClubData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="club-admin-dashboard">Loading club dashboard...</div>;
  }

  if (!clubs.length) {
    return (
      <div className="club-admin-dashboard">
        <h2>Club Admin</h2>
        <p>You are not assigned as an administrator of any active club.</p>
      </div>
    );
  }

  return (
    <div className="club-admin-dashboard">

      <div className="club-admin-header">
        <div>
          <h2>Club Admin Dashboard</h2>
          <p>Manage your club activities and announcements.</p>
        </div>

        <select
          value={selectedClub}
          onChange={e => {
            setSelectedClub(e.target.value);
            setEditingEvent(null);
            setEditingAnnouncement(null);
            setEventForm(EMPTY_EVENT);
            setAnnouncementForm(EMPTY_ANNOUNCEMENT);
            setMemberSearch("");
            clearMessages();
          }}
        >
          {clubs.map(club => (
            <option key={club._id} value={club._id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      <h3>{selectedClubName} Analytics</h3>

      {error && <div className="club-admin-error">{error}</div>}
      {success && <div className="club-admin-success">{success}</div>}

      {/* Analytics */}
      <div className="club-admin-stats-grid">
        <div className="club-admin-stat-card">
          <span>Total Followers</span>
          <strong>{members.length}</strong>
        </div>

        <div className="club-admin-stat-card">
          <span>Total Events</span>
          <strong>{dashboard.totalEvents || 0}</strong>
        </div>

        <div className="club-admin-stat-card">
          <span>Upcoming Events</span>
          <strong>{dashboard.upcomingEvents || 0}</strong>
        </div>

        <div className="club-admin-stat-card">
          <span>Announcements</span>
          <strong>{dashboard.totalAnnouncements || 0}</strong>
        </div>
      </div>

      {/* Followers */}
      <section className="club-admin-section">
        <div className="club-admin-action-header">
          <div>
            <h3>
              <Users size={20} style={{ verticalAlign: "middle" }} /> Followers
            </h3>
            <p>Total students following {selectedClubName}: {members.length}</p>
          </div>
        </div>

        <div className="club-admin-member-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, roll number or department..."
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
          />
        </div>

        {membersLoading ? (
          <p>Loading followers...</p>
        ) : membersError ? (
          <div className="club-admin-error">
            {membersError}
          </div>
        ) : filteredMembers.length === 0 ? (
          <p>
            {members.length === 0
              ? "No students are following this club yet."
              : "No matching followers found."}
          </p>
        ) : (
          <div className="club-admin-list">
            {filteredMembers.map(member => (
              <div className="club-admin-list-card" key={member._id}>
                <div>
                  <h4>
                    {member.name || "Student"}
                  </h4>

                  <p>
                    <Mail size={14} style={{ verticalAlign: "middle" }} />{" "}
                    {member.email || "Email not available"}
                  </p>

                  <p>
                    <GraduationCap size={14} style={{ verticalAlign: "middle" }} />{" "}
                    {member.department || "Department not available"}
                  </p>

                  <p>
                    Roll Number: {member.rollNumber || "Not available"}
                  </p>

                  {member.academicYear && (
                    <p>Academic Year: {member.academicYear}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event analytics */}
      <section className="club-admin-section">
        <h3>Event Status Analytics</h3>

        {chartData.length === 0 ? (
          <p>No event data available for this club yet.</p>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Create event */}
      <section className="club-admin-section">
        <h3>{editingEvent ? "Edit Event" : "Create Event"}</h3>

        <form className="club-admin-event-form" onSubmit={handleEventSubmit}>
          <label>
            Event Title
            <input
              required
              value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="Enter event title"
            />
          </label>

          <div className="club-admin-form-row">
            <label>
              Category
              <select
                value={eventForm.category}
                onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
              >
                <option>Workshop</option>
                <option>Competition</option>
                <option>Seminar</option>
                <option>Cultural</option>
                <option>Technical</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Event Date
              <input
                type="date"
                required
                value={eventForm.eventDate}
                onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })}
              />
            </label>
          </div>

          <div className="club-admin-form-row">
            <label>
              Start Time
              <input
                type="time"
                value={eventForm.startTime}
                onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
              />
            </label>

            <label>
              End Time
              <input
                type="time"
                value={eventForm.endTime}
                onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })}
              />
            </label>
          </div>

          <label>
            Venue
            <input
              required
              value={eventForm.venue}
              onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
              placeholder="Enter venue"
            />
          </label>

          <label>
            Description
            <textarea
              required
              rows={4}
              value={eventForm.description}
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Describe the event"
            />
          </label>

          <div className="club-admin-form-actions">
            <button type="submit" className="club-admin-submit-btn" disabled={saving}>
              {saving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
            </button>

            {editingEvent && (
              <button
                type="button"
                className="club-admin-cancel-btn"
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm(EMPTY_EVENT);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Manage events */}
      <section className="club-admin-section">
        <h3>Manage Events</h3>

        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="club-admin-list">
            {events.map(event => (
              <div className="club-admin-list-card" key={event._id}>
                <div>
                  <h4>{event.title}</h4>
                  <p>{event.category} · {event.venue}</p>
                  <p>
                    {getDateInputValue(event.eventDate)} · {event.startTime || "Time not specified"}
                  </p>
                  <p>Status: {event.status || "Upcoming"}</p>
                </div>

                <div className="club-admin-event-actions">
                  <button className="club-admin-edit-btn" onClick={() => startEditEvent(event)}>
                    Edit
                  </button>
                  <button className="club-admin-delete-btn" onClick={() => deleteEvent(event._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create announcement */}
      <section className="club-admin-section">
        <h3>
          {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
        </h3>

        <form className="club-admin-event-form" onSubmit={handleAnnouncementSubmit}>
          <label>
            Announcement Title
            <input
              required
              maxLength={150}
              value={announcementForm.title}
              onChange={e => setAnnouncementForm({
                ...announcementForm,
                title: e.target.value
              })}
              placeholder="Enter announcement title"
            />
          </label>

          <label>
            Message
            <textarea
              required
              maxLength={2000}
              rows={5}
              value={announcementForm.message}
              onChange={e => setAnnouncementForm({
                ...announcementForm,
                message: e.target.value
              })}
              placeholder="Write your announcement"
            />
          </label>

          <div className="club-admin-form-actions">
            <button type="submit" className="club-admin-submit-btn" disabled={saving}>
              {saving ? "Saving..." : editingAnnouncement ? "Update Announcement" : "Publish Announcement"}
            </button>

            {editingAnnouncement && (
              <button
                type="button"
                className="club-admin-cancel-btn"
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnouncementForm(EMPTY_ANNOUNCEMENT);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Manage announcements */}
      <section className="club-admin-section">
        <h3>Manage Announcements</h3>

        {announcements.length === 0 ? (
          <p>No announcements found.</p>
        ) : (
          <div className="club-admin-list">
            {announcements.map(announcement => (
              <div className="club-admin-list-card" key={announcement._id}>
                <div>
                  <h4>{announcement.title}</h4>
                  <p>{announcement.message}</p>
                  <small>
                    Posted by {announcement.createdBy?.name || "Club Admin"}
                  </small>
                </div>

                <div className="club-admin-event-actions">
                  <button
                    className="club-admin-edit-btn"
                    onClick={() => startEditAnnouncement(announcement)}
                  >
                    Edit
                  </button>

                  <button
                    className="club-admin-delete-btn"
                    onClick={() => deleteAnnouncement(announcement._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
