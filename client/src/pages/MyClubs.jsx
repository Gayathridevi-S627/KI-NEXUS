
import { useEffect, useState } from "react";
import {
  Users,
  Heart,
  Search,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  LoaderCircle,
  Compass,
  X,
  Check
} from "lucide-react";
import "./MyClubs.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MyClubs({ onExplore }) {
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);

  const token = localStorage.getItem("ki_nexus_token");

  useEffect(() => {
    loadMyClubs();
  }, []);

  async function loadMyClubs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/clubs/my-clubs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your clubs");
      }

      setClubs(data.clubs || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function unfollowClub(clubId) {
    setActionId(clubId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE}/clubs/${clubId}/follow`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to unfollow this club");
      }

      setClubs(current =>
        current.filter(club => club._id !== clubId)
      );

      setSelectedClub(current =>
        current?._id === clubId ? null : current
      );

      setSuccess("You have unfollowed this community.");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  const filteredClubs = clubs.filter(club => {
    const searchText = search.toLowerCase().trim();

    return (
      (club.name || "").toLowerCase().includes(searchText) ||
      (club.category || "").toLowerCase().includes(searchText) ||
      (club.description || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="my-clubs-page">
      <div className="my-clubs-heading">
        <div>
          <span className="my-clubs-eyebrow">
            <Heart size={15} />
            YOUR COMMUNITIES
          </span>
          <h1>My Clubs</h1>
          <p>
            Stay connected with the communities you have chosen to follow.
          </p>
        </div>

        <div className="my-clubs-heading-icon">
          <Users size={30} />
        </div>
      </div>

      <div className="my-clubs-summary">
        <div className="my-clubs-summary-icon">
          <Heart size={23} />
        </div>
        <div>
          <strong>{clubs.length}</strong>
          <span>Communities you follow</span>
        </div>
      </div>

      <div className="my-clubs-section-heading">
        <div>
          <h2>Your communities</h2>
          <p>Manage the communities you are following.</p>
        </div>
        <span>{filteredClubs.length} results</span>
      </div>

      <div className="my-clubs-search">
        <Search size={19} />
        <input
          type="text"
          placeholder="Search your communities..."
          value={search}
          onChange={event => setSearch(event.target.value)}
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

      {error && (
        <div className="my-clubs-message error">
          {error}
          <button onClick={loadMyClubs}>Retry</button>
        </div>
      )}

      {success && (
        <div className="my-clubs-message success">
          <Check size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="my-clubs-empty">
          <LoaderCircle size={30} />
          <h3>Loading your communities...</h3>
        </div>
      ) : filteredClubs.length > 0 ? (
        <div className="my-clubs-grid">
          {filteredClubs.map(club => (
            <article className="my-club-card" key={club._id}>
              <div className="my-club-card-top">
                <div
                  className="my-club-avatar"
                  style={{
                    backgroundColor: club.color || "#e9e4ff",
                    color: club.textColor || "#6952b5"
                  }}
                >
                  {club.initials || getInitials(club.name)}
                </div>
                <span className="my-club-category">
                  {club.category}
                </span>
              </div>

              <h3>{club.name}</h3>
              <p>{club.description}</p>

              <div className="my-club-meta">
                <span>
                  <CalendarDays size={15} />
                  {club.meeting || "Details to be announced"}
                </span>
                <span>
                  <MapPin size={15} />
                  {club.location || "KCT Campus"}
                </span>
              </div>

              <div className="my-club-actions">
                <button
                  className="my-club-unfollow"
                  onClick={() => unfollowClub(club._id)}
                  disabled={actionId === club._id}
                >
                  {actionId === club._id ? (
                    <LoaderCircle size={16} />
                  ) : (
                    <Heart size={16} />
                  )}
                  Unfollow
                </button>

                <button
                  className="my-club-view"
                  onClick={() => setSelectedClub(club)}
                >
                  View details
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="my-clubs-empty">
          {clubs.length === 0 ? (
            <>
              <div className="my-clubs-empty-icon">
                <Heart size={30} />
              </div>
              <h3>You haven't followed any communities yet</h3>
              <p>
                Explore campus communities and follow the ones that interest you.
              </p>
              <button onClick={onExplore}>
                <Compass size={17} />
                Explore communities
              </button>
            </>
          ) : (
            <>
              <Search size={30} />
              <h3>No matching communities</h3>
              <p>Try searching with a different name or category.</p>
              <button onClick={() => setSearch("")}>
                Clear search
              </button>
            </>
          )}
        </div>
      )}

      {selectedClub && (
        <div
          className="my-club-modal-overlay"
          onClick={() => setSelectedClub(null)}
        >
          <div
            className="my-club-modal"
            onClick={event => event.stopPropagation()}
          >
            <button
              className="my-club-modal-close"
              onClick={() => setSelectedClub(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="my-club-modal-header">
              <div
                className="my-club-avatar"
                style={{
                  backgroundColor: selectedClub.color || "#e9e4ff",
                  color: selectedClub.textColor || "#6952b5"
                }}
              >
                {selectedClub.initials || getInitials(selectedClub.name)}
              </div>
              <div>
                <span className="my-club-category">
                  {selectedClub.category}
                </span>
                <h2>{selectedClub.name}</h2>
              </div>
            </div>

            <h3>About this community</h3>
            <p>
              {selectedClub.about || selectedClub.description}
            </p>

            {selectedClub.activities?.length > 0 && (
              <>
                <h3>Activities</h3>
                <ul>
                  {selectedClub.activities.map(activity => (
                    <li key={activity}>{activity}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="my-club-modal-info">
              <span>
                <CalendarDays size={16} />
                {selectedClub.meeting || "Details to be announced"}
              </span>
              <span>
                <MapPin size={16} />
                {selectedClub.location || "KCT Campus"}
              </span>
            </div>

            <button
              className="my-club-unfollow modal-unfollow"
              onClick={() => unfollowClub(selectedClub._id)}
              disabled={actionId === selectedClub._id}
            >
              <Heart size={16} />
              Unfollow community
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
