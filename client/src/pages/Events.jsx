
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  ArrowRight,
  X,
  Heart,
  Palette,
  Music,
  Leaf,
  Trophy,
  BookOpen,
  Code,
  Shield,
  Dumbbell,
  Lightbulb,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import "./Explore.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const categories = [
  { name: "Fine Arts", icon: Palette },
  { name: "Performing Arts", icon: Music },
  { name: "Community", icon: Leaf },
  { name: "Kumaraguru Sports", icon: Trophy },
  { name: "Literature", icon: BookOpen },
  { name: "Technical", icon: Code },
  { name: "National Organisation", icon: Shield },
  { name: "Fitness", icon: Dumbbell },
  { name: "Leadership", icon: Lightbulb },
];

// Individual descriptions and activities for all 20 clubs
const clubDetails = {
  PixelD: {
    description:
      "A creative design community where students turn ideas into impactful visual experiences.",
    about:
      "PixelD is a student-led design forum dedicated to visual communication and creative design. Members get opportunities to work on design projects, develop their creative skills and create visual solutions for campus initiatives.",
    activities: [
      "Graphic design",
      "Creative branding",
      "Poster and social media design",
      "Design workshops",
      "Visual communication projects",
    ],
  },

  Nigal: {
    description:
      "A filmmaking community for storytellers, visual creators and cinema enthusiasts.",
    about:
      "Nigal is a filmmaking community and creative space for aspiring filmmakers. Members explore storytelling, cinematography and editing while getting opportunities to document events and create films.",
    activities: [
      "Short film production",
      "Cinematography",
      "Video editing",
      "Film workshops",
      "Event documentation",
    ],
  },

  StudioKCT: {
    description:
      "Capture moments, explore photography and tell stories through your lens.",
    about:
      "StudioKCT is a student-led photography forum where photography enthusiasts develop their visual storytelling skills. Members explore different photography styles and capture memorable moments across campus.",
    activities: [
      "Photography walks",
      "Portrait photography",
      "Event photography",
      "Photo editing",
      "Photography workshops",
    ],
  },

  "Dance Club": {
    description:
      "Express yourself through movement, rhythm and energetic performances.",
    about:
      "Dance Club brings together students who share a passion for dance. Members learn different dance styles, practise choreography and perform at campus celebrations and cultural events.",
    activities: [
      "Dance practice",
      "Choreography",
      "Group performances",
      "Dance workshops",
      "Cultural events",
    ],
  },

  "Music Club": {
    description:
      "A space for singers, instrumentalists and music lovers to create together.",
    about:
      "Music Club provides a platform for students to explore their musical talents. Members collaborate, practise instruments and vocals, and perform at campus events.",
    activities: [
      "Vocal practice",
      "Instrument practice",
      "Jam sessions",
      "Live performances",
      "Music workshops",
    ],
  },

  "Drama Troupe": {
    description:
      "Bring stories to life through theatre, acting and stage performances.",
    about:
      "Drama Troupe is a creative community for students interested in acting and theatre. Members develop stage confidence, explore characters and collaborate to present engaging performances.",
    activities: [
      "Acting workshops",
      "Stage performances",
      "Script writing",
      "Mime and theatre",
      "Stage direction",
    ],
  },

  "Nature Club": {
    description:
      "Connect with nature and make a positive impact on the environment.",
    about:
      "Nature Club encourages students to understand, appreciate and protect the natural environment. Members participate in environmental awareness initiatives and activities that promote sustainable living.",
    activities: [
      "Tree planting",
      "Nature walks",
      "Environmental awareness",
      "Campus cleanliness drives",
      "Sustainability initiatives",
    ],
  },

  "Able Club": {
    description:
      "Promote inclusion, accessibility and equal opportunities for everyone.",
    about:
      "Able Club focuses on empowering individuals and promoting an inclusive community. It encourages students to understand different abilities, support accessibility and participate in initiatives that create a more inclusive society.",
    activities: [
      "Inclusion awareness",
      "Accessibility initiatives",
      "Community engagement",
      "Awareness campaigns",
      "Empowerment activities",
    ],
  },

  Kural: {
    description:
      "Celebrate Tamil language, literature, poetry and the power of words.",
    about:
      "Kural is a literary community for students interested in Tamil language and literature. Members explore poetry, creative writing, literary discussions and activities that celebrate Tamil culture.",
    activities: [
      "Tamil poetry",
      "Creative writing",
      "Literary discussions",
      "Language events",
      "Public speaking",
    ],
  },

  Qubate: {
    description:
      "Question ideas, challenge perspectives and sharpen your debating skills.",
    about:
      "Qubate is a quizzing and debating community where curious minds meet. Members develop general awareness, critical thinking and communication skills through quizzes, discussions and debates.",
    activities: [
      "General knowledge quizzes",
      "Debates",
      "Current affairs discussions",
      "Model United Nations activities",
      "Intercollege competitions",
    ],
  },

  "Books and Beyond": {
    description:
      "A community for readers, writers and curious minds who love exploring ideas.",
    about:
      "Books and Beyond brings together students who enjoy reading, books and intellectual exploration. Members share recommendations, discuss ideas and participate in activities that encourage reading and communication.",
    activities: [
      "Book discussions",
      "Reading challenges",
      "Book recommendations",
      "Literary events",
      "Reading circles",
    ],
  },

  "HAM Club": {
    description:
      "Explore wireless communication, radio technology and hands-on electronics.",
    about:
      "HAM Club introduces students to amateur radio and wireless communication technology. Members explore radio communication concepts, experiment with electronics and learn about communication systems.",
    activities: [
      "Amateur radio awareness",
      "Wireless communication",
      "Electronics experiments",
      "Radio technology workshops",
      "Communication demonstrations",
    ],
  },

  "Aeromodelling Club": {
    description:
      "Design, build and fly models while exploring the science of aviation.",
    about:
      "Aeromodelling Club is for students interested in aircraft and flight technology. Members explore model aircraft, RC simulators and flight mechanisms while developing practical knowledge of aerodynamics and UAVs.",
    activities: [
      "Model aircraft building",
      "RC simulator training",
      "UAV exploration",
      "Flight practice",
      "Aeromodelling competitions",
    ],
  },

  "Robotics Club": {
    description:
      "Turn engineering ideas into intelligent machines through robotics and automation.",
    about:
      "Robotics Club brings together students interested in robotics, automation and hands-on engineering projects. Members explore how mechanical systems, electronics and programming work together to build robotic solutions.",
    activities: [
      "Robot building",
      "Programming and automation",
      "Electronics projects",
      "Robotics workshops",
      "Technical competitions",
    ],
  },

  NCC: {
    description:
      "Build discipline, leadership and patriotism through the National Cadet Corps.",
    about:
      "The National Cadet Corps develops discipline, character, leadership and a spirit of service among students. Cadets participate in structured training, camps and activities that encourage responsibility and national pride.",
    activities: [
      "Parade and drill",
      "Leadership training",
      "NCC camps",
      "Community service",
      "Adventure activities",
    ],
  },

  NSS: {
    description:
      "Serve communities, create awareness and make a difference through volunteering.",
    about:
      "The National Service Scheme encourages students to contribute to society through community service. Volunteers participate in outreach programmes, awareness campaigns and activities that address community needs.",
    activities: [
      "Community outreach",
      "Village development activities",
      "Health awareness camps",
      "Environmental initiatives",
      "Social service programmes",
    ],
  },

  "Runner Club": {
    description:
      "Stay active, challenge your limits and build a community around running.",
    about:
      "Runner Club brings together students who enjoy running and fitness. Members work towards improving their endurance, building healthy habits and participating in running activities.",
    activities: [
      "Group running sessions",
      "Endurance training",
      "Fitness challenges",
      "Running events",
      "Healthy lifestyle awareness",
    ],
  },

  "Agam Forum": {
    description:
      "Discover fitness, wellbeing and a healthier way of living.",
    about:
      "Agam Forum is a student community focused on fitness and wellbeing. It encourages students to build healthy habits, stay physically active and take part in activities that support overall wellness.",
    activities: [
      "Fitness activities",
      "Wellness awareness",
      "Healthy lifestyle initiatives",
      "Group activities",
      "Physical wellbeing programmes",
    ],
  },

  "Bikers Club": {
    description:
      "Bring together motorcycle enthusiasts who share a passion for riding and road culture.",
    about:
      "Bikers Club connects students who are interested in motorcycles and riding culture. The community encourages responsible riding, road safety awareness and opportunities to connect with fellow enthusiasts.",
    activities: [
      "Rider meetups",
      "Road safety awareness",
      "Motorcycle discussions",
      "Responsible riding initiatives",
      "Group activities",
    ],
  },

  CLED: {
    description:
      "Develop confidence, leadership abilities and the skills to create positive change.",
    about:
      "CLED is a leadership-focused community that encourages students to develop communication, teamwork, decision-making and organisational skills. Members get opportunities to collaborate and grow as responsible leaders.",
    activities: [
      "Leadership workshops",
      "Team-building activities",
      "Communication skills",
      "Organising initiatives",
      "Personal development",
    ],
  },
};

function getToken() {
  return localStorage.getItem("ki_nexus_token");
}

function getInitials(name) {
  return (
    name
      ?.split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "KCT"
  );
}

function Explore() {
  const [clubs, setClubs] = useState([]);
  const [followedClubs, setFollowedClubs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState("");

  const token = getToken();

  // Fetch clubs from MongoDB and add their descriptions
  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/clubs`);

      if (!response.ok) {
        throw new Error("Unable to load clubs");
      }

      const data = await response.json();

      const enrichedClubs = (data.clubs || []).map((club) => {
        const details = clubDetails[club.name];

        return {
          ...club,
          description:
            details?.description ||
            club.description ||
            club.about ||
            `Discover ${club.name} at KCT.`,
          about:
            details?.about ||
            club.about ||
            club.description ||
            `Welcome to ${club.name} at KCT.`,
          activities:
            details?.activities ||
            club.activities ||
            [],
        };
      });

      setClubs(enrichedClubs);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fetch followed clubs
  const fetchFollowedClubs = async () => {
    if (!token) {
      setFollowedClubs([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clubs/my-clubs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      setFollowedClubs(
        (data.clubs || []).map((club) => club._id)
      );
    } catch (err) {
      console.error("Error loading followed clubs:", err);
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchFollowedClubs();
  }, []);

  // Search and category filtering
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesCategory =
        activeCategory === "All" ||
        club.category === activeCategory;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        club.name?.toLowerCase().includes(searchText) ||
        club.category?.toLowerCase().includes(searchText) ||
        club.description?.toLowerCase().includes(searchText) ||
        club.about?.toLowerCase().includes(searchText) ||
        club.activities?.some((activity) =>
          activity.toLowerCase().includes(searchText)
        );

      return matchesCategory && matchesSearch;
    });
  }, [clubs, activeCategory, search]);

  // Group clubs under verticals
  const groupedClubs = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      clubs: filteredClubs.filter(
        (club) => club.category === category.name
      ),
    }));
  }, [filteredClubs]);

  // Follow or unfollow
  const toggleFollow = async (club) => {
    if (!token) {
      alert("Please log in to follow clubs.");
      return;
    }

    const isFollowing = followedClubs.includes(club._id);

    try {
      setFollowLoading(club._id);

      const response = await fetch(
        `${API_URL}/clubs/${club._id}/follow`,
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update follow status"
        );
      }

      setFollowedClubs((previous) =>
        isFollowing
          ? previous.filter((id) => id !== club._id)
          : [...previous, club._id]
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setFollowLoading("");
    }
  };

  // Club card
  const renderClubCard = (club) => {
    const isFollowing = followedClubs.includes(club._id);
    const initials = club.initials || getInitials(club.name);

    return (
      <article className="explore-club-card" key={club._id}>
        <div className="club-card-top">
          <div
            className="club-avatar"
            style={{
              background: club.color || "#eeebff",
              color: club.textColor || "#6555bb",
              overflow: "hidden",
            }}
          >
            {club.image ? (
              <img
                src={club.image}
                alt={club.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              initials
            )}
          </div>

          <span className="club-category">
            {club.category}
          </span>
        </div>

        <h3>{club.name}</h3>

        <p className="club-description">
          {club.description}
        </p>

        <div className="club-meta">
          {club.location && (
            <span>
              <MapPin size={14} />
              {club.location}
            </span>
          )}

          {club.meeting && (
            <span>
              <Clock size={14} />
              {club.meeting}
            </span>
          )}

          <span>
            <Users size={14} />
            KCT Community
          </span>
        </div>

        <div className="club-card-actions">
          <button
            className={`follow-button ${
              isFollowing ? "following" : ""
            }`}
            onClick={() => toggleFollow(club)}
            disabled={followLoading === club._id}
          >
            {followLoading === club._id ? (
              "Please wait..."
            ) : (
              <>
                <Heart
                  size={15}
                  fill={isFollowing ? "currentColor" : "none"}
                />
                {isFollowing ? "Following" : "Follow"}
              </>
            )}
          </button>

          <button
            className="view-club-button"
            onClick={() => setSelectedClub(club)}
          >
            View Club <ArrowRight size={14} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="explore-page">
      {/* Hero banner */}
      <section className="explore-banner">
        <div className="explore-banner-content">
          <span className="banner-label">
            DISCOVER YOUR COMMUNITY
          </span>

          <h2>Find Your People. Find Your Passion.</h2>

          <p>
            Explore clubs, discover interests, build connections
            and become part of something amazing at
            Kumaraguru College of Technology.
          </p>

          <div className="banner-stats">
            <div>
              <strong>{clubs.length}</strong>
              <span>Clubs</span>
            </div>

            <div>
              <strong>{categories.length}</strong>
              <span>Verticals</span>
            </div>

            <div>
              <strong>{followedClubs.length}</strong>
              <span>Following</span>
            </div>
          </div>
        </div>

        <div className="banner-decoration">
          <div className="decoration-orbit"></div>

          <div className="decoration-circle circle-one">
            <Palette size={27} />
          </div>

          <div className="decoration-circle circle-two">
            <Music size={27} />
          </div>

          <div className="decoration-circle circle-three">
            <Users size={27} />
          </div>
        </div>
      </section>

      {/* Page heading */}
      <div className="explore-heading">
        <div>
          <span className="explore-eyebrow">
            <CheckCircle size={13} />
            KCT COMMUNITIES
          </span>

          <h1>Explore Clubs</h1>

          <p>
            Find a community that matches your interests.
          </p>
        </div>

        <div className="explore-heading-icon">
          <Users size={27} />
        </div>
      </div>

      {/* Search */}
      <div className="explore-search">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search clubs or interests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="explore-categories">
        <button
          className={`category-chip ${
            activeCategory === "All" ? "active" : ""
          }`}
          onClick={() => setActiveCategory("All")}
        >
          All
        </button>

        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.name}
              className={`category-chip ${
                activeCategory === category.name ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              <Icon size={14} />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Results heading */}
      <div className="explore-section-heading">
        <div>
          <h2>
            {activeCategory === "All"
              ? "All Verticals"
              : activeCategory}
          </h2>

          <p>
            Discover the clubs available at KCT.
          </p>
        </div>

        <span className="explore-result-count">
          {filteredClubs.length} clubs found
        </span>
      </div>

      {/* Loading, error and club sections */}
      {loading ? (
        <div className="explore-empty">
          <Users size={30} />
          <h3>Loading clubs...</h3>
          <p>Please wait while we load the communities.</p>
        </div>
      ) : error ? (
        <div className="explore-empty">
          <h3>Unable to load clubs</h3>
          <p>{error}</p>
          <button onClick={fetchClubs}>Try Again</button>
        </div>
      ) : filteredClubs.length === 0 && search ? (
        <div className="explore-empty">
          <Search size={30} />
          <h3>No clubs found</h3>
          <p>
            No clubs match "{search}". Try another search.
          </p>

          <button onClick={() => setSearch("")}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="explore-verticals">
          {groupedClubs
            .filter(
              (group) =>
                activeCategory === "All" ||
                group.name === activeCategory
            )
            .map((group) => {
              const Icon = group.icon;

              return (
                <section
                  className="explore-vertical-section"
                  key={group.name}
                >
                  <div className="explore-section-heading">
                    <div>
                      <h2>
                        <Icon
                          size={19}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: "9px",
                            color: "#6d5bd0",
                          }}
                        />
                        {group.name}
                      </h2>

                      <p>
                        {group.clubs.length}{" "}
                        {group.clubs.length === 1
                          ? "club"
                          : "clubs"}
                      </p>
                    </div>
                  </div>

                  {group.clubs.length > 0 ? (
                    <div className="explore-club-grid">
                      {group.clubs.map(renderClubCard)}
                    </div>
                  ) : (
                    <div className="vertical-empty">
                      <Icon size={28} />

                      <h3>Clubs coming soon!</h3>

                      <p>
                        New communities in {group.name} will
                        be added soon.
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      )}

      {/* Club details modal */}
      {selectedClub && (
        <div
          className="club-modal-overlay"
          onClick={() => setSelectedClub(null)}
        >
          <div
            className="club-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedClub(null)}
              aria-label="Close club details"
            >
              <X size={19} />
            </button>

            <div className="modal-club-header">
              <div
                className="club-avatar modal-avatar"
                style={{
                  background: selectedClub.color || "#eeebff",
                  color: selectedClub.textColor || "#6555bb",
                  overflow: "hidden",
                }}
              >
                {selectedClub.image ? (
                  <img
                    src={selectedClub.image}
                    alt={selectedClub.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  selectedClub.initials ||
                  getInitials(selectedClub.name)
                )}
              </div>

              <div>
                <span className="club-category">
                  {selectedClub.category}
                </span>

                <h2>{selectedClub.name}</h2>

                <span className="modal-member-count">
                  <Users size={13} />
                  KCT Community
                </span>
              </div>
            </div>

            <div className="modal-content-section">
              <h3>About the Club</h3>

              <p>{selectedClub.about}</p>
            </div>

            {selectedClub.activities?.length > 0 && (
              <div className="modal-content-section">
                <h3>What We Do</h3>

                <div className="activity-list">
                  {selectedClub.activities.map(
                    (activity, index) => (
                      <div
                        className="activity-item"
                        key={index}
                      >
                        <CheckCircle size={15} />
                        {activity}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {(selectedClub.location ||
              selectedClub.meeting) && (
              <div className="modal-info-row">
                {selectedClub.location && (
                  <span>
                    <MapPin size={14} />
                    {selectedClub.location}
                  </span>
                )}

                {selectedClub.meeting && (
                  <span>
                    <Clock size={14} />
                    {selectedClub.meeting}
                  </span>
                )}
              </div>
            )}

            <button
              className={`modal-follow-button ${
                followedClubs.includes(selectedClub._id)
                  ? "following"
                  : ""
              }`}
              onClick={() => toggleFollow(selectedClub)}
              disabled={followLoading === selectedClub._id}
            >
              <Heart
                size={17}
                fill={
                  followedClubs.includes(selectedClub._id)
                    ? "currentColor"
                    : "none"
                }
              />

              {followLoading === selectedClub._id
                ? "Please wait..."
                : followedClubs.includes(selectedClub._id)
                ? "Following"
                : "Follow Club"}
            </button>

            <p className="modal-demo-note">
              <Users size={13} />
              Connect with your campus community through KI NEXUS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;
