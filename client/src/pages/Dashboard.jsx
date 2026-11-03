
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Users,
  Compass,
  Heart,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function Dashboard({ student, token, setActivePage }) {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const results = await Promise.allSettled([
          fetch(`${API_BASE}/clubs`),
          fetch(`${API_BASE}/events`),
          fetch(`${API_BASE}/clubs/my-clubs`, { headers })
        ]);

        const [clubsResult, eventsResult, myClubsResult] = results;

        if (clubsResult.status === "fulfilled" && clubsResult.value.ok) {
          const data = await clubsResult.value.json();
          setClubs(Array.isArray(data.clubs) ? data.clubs : []);
        } else {
          throw new Error("Unable to load communities.");
        }

        if (eventsResult.status === "fulfilled" && eventsResult.value.ok) {
          const data = await eventsResult.value.json();
          setEvents(Array.isArray(data.events) ? data.events : []);
        } else {
          throw new Error("Unable to load events.");
        }

        if (myClubsResult.status === "fulfilled" && myClubsResult.value.ok) {
          const data = await myClubsResult.value.json();
          setMyClubs(Array.isArray(data.clubs) ? data.clubs : []);
        }
      } catch (err) {
        setError(err.message || "Unable to load dashboard information.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const allUpcomingEvents = events
    .filter(event => {
      const date = new Date(event.eventDate);

      return (
        !Number.isNaN(date.getTime()) &&
        date >= new Date() &&
        ["Upcoming", "Ongoing"].includes(event.status)
      );
    })
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const upcomingEvents = allUpcomingEvents.slice(0, 3);

  const categories = [
    ...new Set(clubs.map(club => club.category).filter(Boolean))
  ];

  const firstName = student?.name?.split(" ")[0] || "Student";

  if (loading) {
    return (
      <div className="dashboard-content dashboard-loading">
        <p>Loading your campus dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <section className="welcome-banner">
        <div className="banner-overlay">
          <span className="banner-tag">
            <Sparkles size={14} /> YOUR CAMPUS, YOUR COMMUNITY
          </span>

          <h1>
            Discover your place
            <br />
            in the campus.
          </h1>

          <p>
            Welcome, {firstName}! Explore communities, discover events
            and connect with people who share your interests.
          </p>

          <button
            className="banner-button"
            onClick={() => setActivePage("Explore Clubs")}
          >
            Explore communities <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <section className="dashboard-stats">
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon blue">
            <Users size={22} />
          </div>

          <div>
            <span>Active communities</span>
            <h2>{clubs.length}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon green">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Upcoming events</span>
            <h2>{allUpcomingEvents.length}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon pink">
            <Heart size={22} />
          </div>

          <div>
            <span>My communities</span>
            <h2>{myClubs.length}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon orange">
            <Compass size={22} />
          </div>

          <div>
            <span>Interest categories</span>
            <h2>{categories.length}</h2>
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CAMPUS COMMUNITIES</span>
            <h2>Explore communities</h2>
            <p>Discover clubs and forums across campus.</p>
          </div>

          <button
            className="text-link"
            onClick={() => setActivePage("Explore Clubs")}
          >
            View all <ArrowRight size={16} />
          </button>
        </div>

        {clubs.length === 0 ? (
          <p className="dashboard-empty">
            No communities available yet.
          </p>
        ) : (
          <div className="club-grid">
            {clubs.slice(0, 4).map(club => (
              <article className="club-card" key={club._id}>
                <div
                  className="club-avatar"
                  style={{
                    backgroundColor: club.color || "#263C78"
                  }}
                >
                  {club.initials || club.name?.charAt(0) || "C"}
                </div>

                <h3>{club.name}</h3>
                <p>{club.description}</p>
                <span>{club.category}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section-block events-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WHAT'S HAPPENING</span>
            <h2>Upcoming events</h2>
            <p>Stay connected with campus activities.</p>
          </div>

          <button
            className="text-link"
            onClick={() => setActivePage("Events")}
          >
            All events <ArrowRight size={16} />
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="dashboard-empty">
            No upcoming events available.
          </p>
        ) : (
          <div className="event-grid">
            {upcomingEvents.map(event => (
              <article className="event-card" key={event._id}>
                <div className="event-type">
                  {event.category}
                </div>

                <h3>{event.title}</h3>

                <span className="event-club">
                  {event.organizer?.name || "Campus Event"}
                </span>

                <div className="event-details">
                  <span>
                    <CalendarDays size={15} />
                    {new Date(event.eventDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>

                  {event.startTime && (
                    <span>
                      <Clock size={15} />
                      {event.startTime}
                    </span>
                  )}

                  <span>
                    <MapPin size={15} />
                    {event.venue}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <span>KI NEXUS · KCT CAMPUS COMMUNITY</span>
        <span>Discover. Connect. Belong.</span>
      </footer>
    </div>
  );
}

export default Dashboard;
