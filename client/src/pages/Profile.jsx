
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  GraduationCap,
  CalendarDays,
  ShieldCheck,
  Hash,
  Pencil,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import "./Profile.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function Profile({ student, onStudentUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    bio: "",
    department: "",
    academicYear: "",
    interests: []
  });

  useEffect(() => {
    setForm({
      name: student?.name || "",
      bio: student?.bio || "",
      department: student?.department || "",
      academicYear: student?.academicYear || "",
      interests: student?.interests || []
    });
  }, [student]);

  const initials = (student?.name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const joinedDate = student?.createdAt
    ? new Date(student.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "Not available";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const addInterest = () => {
    const interest = interestInput.trim();

    if (!interest) return;

    if (form.interests.some(
      (item) => item.toLowerCase() === interest.toLowerCase()
    )) {
      setError("This interest has already been added.");
      return;
    }

    if (form.interests.length >= 15) {
      setError("You can add a maximum of 15 interests.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      interests: [...previous.interests, interest]
    }));

    setInterestInput("");
    setError("");
  };

  const removeInterest = (interest) => {
    setForm((previous) => ({
      ...previous,
      interests: previous.interests.filter(
        (item) => item !== interest
      )
    }));
  };

  const handleCancel = () => {
    setForm({
      name: student?.name || "",
      bio: student?.bio || "",
      department: student?.department || "",
      academicYear: student?.academicYear || "",
      interests: student?.interests || []
    });

    setInterestInput("");
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    const token = localStorage.getItem("ki_nexus_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          department: form.department,
          academicYear: form.academicYear,
          interests: form.interests
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update profile.");
      }

      onStudentUpdate(data.student);
      localStorage.setItem(
        "ki_nexus_student",
        JSON.stringify(data.student)
      );

      setForm({
        name: data.student.name || "",
        bio: data.student.bio || "",
        department: data.student.department || "",
        academicYear: data.student.academicYear || "",
        interests: data.student.interests || []
      });

      setIsEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <span className="profile-eyebrow">YOUR ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and interests.</p>
        </div>

        {!isEditing && (
          <button
            className="profile-edit-button"
            onClick={() => {
              setSuccess("");
              setError("");
              setIsEditing(true);
            }}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="profile-message success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {error && (
        <div className="profile-message error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section className="profile-hero">
        <div className="profile-avatar">
          {initials || <UserRound size={38} />}
        </div>

        <div className="profile-hero-info">
          <h2>{student?.name || "Student"}</h2>
          <p>{student?.email || "Email not available"}</p>
          <span className="profile-status">
            <ShieldCheck size={15} />
            Registered Student
          </span>
        </div>
      </section>

      {isEditing ? (
        <form className="profile-section profile-edit-form" onSubmit={handleSave}>
          <div className="profile-section-heading">
            <div>
              <h2>Edit Personal Information</h2>
              <p>Update the information displayed on your profile.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <label className="profile-field">
              Full Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Enter your full name"
              />
            </label>

            <label className="profile-field">
              Department
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                maxLength={100}
                placeholder="Example: Computer Science and Engineering"
              />
            </label>

            <label className="profile-field">
              Academic Year
              <select
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
              >
                <option value="">Select academic year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </label>

            <label className="profile-field">
              Email Address
              <input
                type="email"
                value={student?.email || ""}
                disabled
              />
              <small>Email cannot be changed here.</small>
            </label>

            <label className="profile-field profile-field-full">
              Bio
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength={300}
                rows={4}
                placeholder="Tell others a little about yourself..."
              />
              <small>{form.bio.length}/300 characters</small>
            </label>

            <div className="profile-field profile-field-full">
              <label htmlFor="interestInput">Areas of Interest</label>

              <div className="interest-input-row">
                <input
                  id="interestInput"
                  type="text"
                  value={interestInput}
                  onChange={(event) => setInterestInput(event.target.value)}
                  maxLength={40}
                  placeholder="Example: Web Development"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <button
                  type="button"
                  className="interest-add-button"
                  onClick={addInterest}
                >
                  <Plus size={17} />
                  Add
                </button>
              </div>

              <div className="interest-tags">
                {form.interests.map((interest) => (
                  <span className="interest-tag" key={interest}>
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      aria-label={`Remove ${interest}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              <small>Add up to 15 interests.</small>
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <section className="profile-section">
            <div className="profile-section-heading">
              <div>
                <h2>Personal Information</h2>
                <p>Your registered student details.</p>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail-card">
                <div className="profile-detail-icon">
                  <UserRound size={19} />
                </div>
                <div>
                  <span>Full Name</span>
                  <strong>{student?.name || "Not available"}</strong>
                </div>
              </div>

              <div className="profile-detail-card">
                <div className="profile-detail-icon">
                  <Mail size={19} />
                </div>
                <div>
                  <span>Email Address</span>
                  <strong>{student?.email || "Not available"}</strong>
                </div>
              </div>

              <div className="profile-detail-card">
                <div className="profile-detail-icon">
                  <Hash size={19} />
                </div>
                <div>
                  <span>Roll Number</span>
                  <strong>{student?.rollNumber || "Not available"}</strong>
                </div>
              </div>

              <div className="profile-detail-card">
                <div className="profile-detail-icon">
                  <GraduationCap size={19} />
                </div>
                <div>
                  <span>Department</span>
                  <strong>{student?.department || "Not added yet"}</strong>
                </div>
              </div>

              <div className="profile-detail-card">
                <div className="profile-detail-icon">
                  <GraduationCap size={19} />
                </div>
                <div>
                  <span>Academic Year</span>
                  <strong>{student?.academicYear || "Not added yet"}</strong>
                </div>
              </div>

              <div className="profile-detail-card">
                <div className="profile-detail-icon">
                  <CalendarDays size={19} />
                </div>
                <div>
                  <span>Account Created</span>
                  <strong>{joinedDate}</strong>
                </div>
              </div>
            </div>

            <div className="profile-bio">
              <h3>About Me</h3>
              <p>{student?.bio || "No bio added yet."}</p>
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section-heading">
              <div>
                <h2>My Interests</h2>
                <p>Topics and activities you are interested in.</p>
              </div>
            </div>

            {student?.interests?.length > 0 ? (
              <div className="interest-tags profile-view-interests">
                {student.interests.map((interest) => (
                  <span className="interest-tag static" key={interest}>
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-empty-text">
                You haven't added any interests yet. Select Edit Profile to add them.
              </p>
            )}
          </section>
        </>
      )}

      <section className="profile-section profile-note">
        <div className="profile-note-icon">
          <ShieldCheck size={21} />
        </div>
        <div>
          <h3>Account Information</h3>
          <p>
            Your profile is linked to your KI Nexus student account.
            Your email, roll number and password are protected from changes
            through this form.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Profile;
