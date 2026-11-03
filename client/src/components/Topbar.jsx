
import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Mail,
  GraduationCap,
  LogOut
} from "lucide-react";

function Topbar({ pageTitle = "Overview", student, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);

  const studentName = student?.name || "KCT Student";
  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-divider">/</span>
        <strong>{pageTitle}</strong>
      </div>

      <div className="topbar-right">
        <div className="top-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search clubs, events..."
          />
          <span className="search-shortcut">⌘ K</span>
        </div>

        <button
          className="icon-button notification-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile-container">
          <button
            className="user-profile"
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
          >
            <div className="user-avatar">{initials}</div>

            <div className="user-info">
              <strong>{studentName}</strong>
              <span>Student Account</span>
            </div>

            <ChevronDown
              size={16}
              className={profileOpen ? "profile-chevron open" : "profile-chevron"}
            />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="dropdown-avatar">{initials}</div>
                <div>
                  <strong>{studentName}</strong>
                  <span>Student Account</span>
                </div>
              </div>

              <div className="profile-detail">
                <Mail size={15} />
                <span>{student?.email || "Email unavailable"}</span>
              </div>

              <div className="profile-detail">
                <GraduationCap size={16} />
                <span>{student?.rollNumber || "Roll number unavailable"}</span>
              </div>

              <div className="profile-dropdown-divider"></div>

              <button
                className="profile-logout"
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout?.();
                }}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
