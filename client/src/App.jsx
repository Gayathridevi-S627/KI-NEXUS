
import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import MyClubs from "./pages/MyClubs";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import Notifications from "./pages/Notifications";
import ClubAdmin from "./components/ClubAdmin";

import { ArrowRight } from "lucide-react";

import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function App() {
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(null);
  const [activePage, setActivePage] = useState("Overview");
  const [checkingSession, setCheckingSession] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check saved login session
  useEffect(() => {
    const savedToken = localStorage.getItem("ki_nexus_token");

    if (
      !savedToken ||
      savedToken === "undefined" ||
      savedToken === "null"
    ) {
      localStorage.removeItem("ki_nexus_token");
      setCheckingSession(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        setStudent(data.student);
        setToken(savedToken);
      } catch (error) {
        console.error("Session verification failed:", error.message);

        localStorage.removeItem("ki_nexus_token");
        localStorage.removeItem("ki_nexus_student");

        setStudent(null);
        setToken(null);
      } finally {
        setCheckingSession(false);
      }
    };

    verifySession();
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error(
          "Unable to fetch unread notification count:",
          error
        );
      }
    };

    fetchUnreadCount();
  }, [token]);

  // Login
  const handleLogin = (loggedInStudent, authToken) => {
    if (
      typeof authToken !== "string" ||
      authToken.split(".").length !== 3
    ) {
      console.error("Login did not return a valid JWT.");
      return;
    }

    localStorage.setItem("ki_nexus_token", authToken);

    localStorage.setItem(
      "ki_nexus_student",
      JSON.stringify(loggedInStudent)
    );

    setStudent(loggedInStudent);
    setToken(authToken);
    setUnreadCount(0);
    setActivePage("Overview");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("ki_nexus_token");
    localStorage.removeItem("ki_nexus_student");

    setStudent(null);
    setToken(null);
    setUnreadCount(0);
    setActivePage("Overview");
  };

  // Update student profile
  const handleStudentUpdate = (updatedStudent) => {
    setStudent(updatedStudent);

    localStorage.setItem(
      "ki_nexus_student",
      JSON.stringify(updatedStudent)
    );
  };

  const isClubAdmin =
    student?.role === "clubAdmin" ||
    student?.role === "admin";

  const pageTitles = {
    Overview: "Overview",
    "Explore Clubs": "Explore Clubs",
    "My Clubs": "My Clubs",
    "My Profile": "My Profile",
    Events: "Events",
    Notifications: "Notifications",
    "Club Admin": "Club Admin",
    Settings: "Settings"
  };

  // Loading screen
  if (checkingSession) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-symbol">K</div>
        <p>Loading KI Nexus...</p>
      </div>
    );
  }

  // Login screen
  if (!student || !token) {
    return <Login onLogin={handleLogin} />;
  }

  // Prevent students from opening the admin dashboard
  const handlePageChange = (page) => {
    if (page === "Logout") {
      handleLogout();
      return;
    }

    if (page === "Club Admin" && !isClubAdmin) {
      setActivePage("Overview");
      return;
    }

    setActivePage(page);
  };

  // Main application
  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        unreadCount={unreadCount}
        setActivePage={handlePageChange}
        isClubAdmin={isClubAdmin}
      />

      <main className="main-content">
        <Topbar
          pageTitle={pageTitles[activePage] || "Overview"}
          student={student}
          onLogout={handleLogout}
        />

        {activePage === "Overview" && (
          <Dashboard
            student={student}
            token={token}
            setActivePage={setActivePage}
          />
        )}

        {activePage === "Explore Clubs" && (
          <div className="dashboard-content">
            <Explore />
          </div>
        )}

        {activePage === "My Clubs" && (
          <div className="dashboard-content">
            <MyClubs
              onExplore={() => setActivePage("Explore Clubs")}
            />
          </div>
        )}

        {activePage === "My Profile" && (
          <Profile
            student={student}
            onStudentUpdate={handleStudentUpdate}
          />
        )}

        {activePage === "Events" && (
          <div className="dashboard-content">
            <Events />
          </div>
        )}

        {activePage === "Notifications" && (
          <Notifications
            token={token}
            onUnreadCountChange={setUnreadCount}
          />
        )}

        {activePage === "Club Admin" && isClubAdmin && (
          <ClubAdmin token={token} />
        )}

        {activePage !== "Overview" &&
          activePage !== "Explore Clubs" &&
          activePage !== "My Clubs" &&
          activePage !== "My Profile" &&
          activePage !== "Events" &&
          activePage !== "Notifications" &&
          activePage !== "Club Admin" && (
            <div className="dashboard-content">
              <div className="placeholder-page">
                <span className="eyebrow">
                  KI NEXUS WORKSPACE
                </span>

                <h1>{activePage}</h1>

                <p>
                  This section will be available in the next
                  development milestone.
                </p>

                <button
                  className="banner-button"
                  onClick={() => setActivePage("Overview")}
                >
                  Back to overview <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}

export default App;
