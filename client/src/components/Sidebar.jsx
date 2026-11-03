
import {
  Home,
  Compass,
  Heart,
  CalendarDays,
  Bell,
  Settings,
  LogOut,
  Network,
  UserRound,
  ShieldCheck
} from "lucide-react";

const menuItems = [
  { label: "Overview", icon: Home },
  { label: "Explore Clubs", icon: Compass },
  { label: "My Clubs", icon: Heart },
  { label: "My Profile", icon: UserRound },
  { label: "Events", icon: CalendarDays },
  { label: "Notifications", icon: Bell }
];

function Sidebar({
  activePage,
  setActivePage,
  unreadCount = 0,
  isClubAdmin = false
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Network size={22} />
        </div>

        <div>
          <h2>KI NEXUS</h2>
          <span>KCT Campus Community</span>
        </div>
      </div>

      <div className="sidebar-label">MENU</div>

      <nav className="sidebar-nav">
        {menuItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${
              activePage === label ? "active" : ""
            }`}
            onClick={() => setActivePage(label)}
          >
            <Icon size={19} />

            <span>{label}</span>

            {label === "Notifications" && unreadCount > 0 && (
              <span className="nav-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        ))}

        {isClubAdmin && (
          <>
            <div className="sidebar-label admin-menu-label">
              ADMINISTRATION
            </div>

            <button
              className={`nav-item ${
                activePage === "Club Admin" ? "active" : ""
              }`}
              onClick={() => setActivePage("Club Admin")}
            >
              <ShieldCheck size={19} />
              <span>Club Admin</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${
            activePage === "Settings" ? "active" : ""
          }`}
          onClick={() => setActivePage("Settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <button
          className="nav-item"
          onClick={() => setActivePage("Logout")}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

        <div className="sidebar-footer">
          <div className="footer-avatar">K</div>

          <div>
            <strong>KCT</strong>
            <span>Campus Network</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
