
import { useEffect, useState } from "react";
import { Bell, CalendarDays, Users, Info, Check, CheckCheck } from "lucide-react";
import "./Notifications.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function Notifications({ token, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load notifications");
      }

      setNotifications(data.notifications || []);
      onUnreadCountChange?.(data.unreadCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const markAsRead = async id => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update notification");
      }

      setNotifications(previous =>
        previous.map(item =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );

      await fetchNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update notifications");
      }

      await fetchNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const unreadCount = notifications.filter(item => !item.isRead).length;

  const filteredNotifications = notifications.filter(item => {
    if (filter === "Unread") return !item.isRead;
    if (filter === "Read") return item.isRead;
    return true;
  });

  const getIcon = type => {
    if (type === "event") return CalendarDays;
    if (type === "club") return Users;
    return Info;
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <span className="eyebrow">STAY CONNECTED</span>
          <h1>Notifications</h1>
          <p>Keep track of updates from your campus community.</p>
        </div>

        <button
          className="mark-all-button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </div>

      <div className="notification-summary">
        <div>
          <span>Total notifications</span>
          <strong>{notifications.length}</strong>
        </div>
        <div>
          <span>Unread notifications</span>
          <strong>{unreadCount}</strong>
        </div>
      </div>

      <div className="notification-filters">
        {["All", "Unread", "Read"].map(item => (
          <button
            key={item}
            className={filter === item ? "selected" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="notification-error">
          {error}
          <button onClick={fetchNotifications}>Retry</button>
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <Bell size={32} />
          <h3>No notifications yet</h3>
          <p>Campus updates and announcements will appear here.</p>
        </div>
      ) : (
        <div className="notification-list">
          {filteredNotifications.map(item => {
            const Icon = getIcon(item.type);

            return (
              <article
                className={`notification-card ${item.isRead ? "read" : "unread"}`}
                key={item._id}
              >
                <div className="notification-icon">
                  <Icon size={21} />
                </div>

                <div className="notification-body">
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>
                  <span className="notification-date">
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>

                {!item.isRead && (
                  <button
                    className="notification-read-button"
                    onClick={() => markAsRead(item._id)}
                    title="Mark as read"
                  >
                    <Check size={17} />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
