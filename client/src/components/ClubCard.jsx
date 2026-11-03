
import { ArrowUpRight, Users } from "lucide-react";

function ClubCard({ club, onClick }) {
  const initials =
    club.initials ||
    club.initial ||
    club.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  return (
    <article className="club-card">
      <div className="club-card-top">
        <div
          className="club-logo"
          style={{
            background: club.color || "#e9e4ff",
            color: club.textColor || "#6952b5"
          }}
        >
          {initials}
        </div>

        <button
          className="card-arrow"
          aria-label={`View ${club.name}`}
          onClick={() => onClick?.(club)}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div className="club-card-content">
        <span className="club-category">
          {club.category}
        </span>

        <h3>{club.name}</h3>

        <p>{club.description}</p>
      </div>

      <div className="club-card-footer">
        <span>
          <Users size={15} />
          {club.followers || 0} followers
        </span>

        <span className="club-status">Active</span>
      </div>
    </article>
  );
}

export default ClubCard;
