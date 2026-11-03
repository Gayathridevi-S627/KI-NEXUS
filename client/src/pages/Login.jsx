
import { useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
  GraduationCap
} from "lucide-react";
import "./Login.css";

// Works locally through Vite proxy and on Vercel through /api
const API_BASE = import.meta.env.VITE_API_URL || "/api";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const endpoint =
      mode === "login" ? "/auth/login" : "/auth/register";

    const payload =
      mode === "login"
        ? {
            email: form.email,
            password: form.password
          }
        : {
            name: form.name,
            email: form.email,
            rollNumber: form.rollNumber,
            password: form.password
          };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (mode === "register") {
        setMessage(
          "Registration successful! You can now log in."
        );

        setMode("login");

        setForm({
          name: "",
          email: form.email,
          rollNumber: "",
          password: ""
        });
      } else {
        localStorage.setItem("ki_nexus_token", data.token);

        localStorage.setItem(
          "ki_nexus_student",
          JSON.stringify(data.student)
        );

        onLogin(data.student, data.token);
      }
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left branding section */}
      <div className="login-left">

        <div className="login-brand">
          <div className="brand-symbol">K</div>
          <span>KI NEXUS</span>
        </div>

        <div className="login-hero">

          <span className="login-eyebrow">
            YOUR CAMPUS. YOUR COMMUNITY.
          </span>

          <h1>
            Find your people.
            <br />
            Discover your place.
          </h1>

          <p>
            Connect with student communities, discover campus
            opportunities and make your college experience meaningful.
          </p>

          <div className="login-feature">

            <div className="feature-icon">
              <GraduationCap size={22} />
            </div>

            <div>
              <strong>
                One campus. Endless possibilities.
              </strong>

              <span>
                Discover. Connect. Belong.
              </span>
            </div>

          </div>
        </div>

        <div className="login-left-footer">
          KUMARAGURU COLLEGE OF TECHNOLOGY
        </div>

      </div>

      {/* Right authentication section */}
      <div className="login-right">

        <div className="login-form-container">

          <div className="mobile-brand">
            <div className="brand-symbol">K</div>
            <span>KI NEXUS</span>
          </div>

          <span className="form-eyebrow">
            {mode === "login"
              ? "WELCOME BACK"
              : "JOIN THE COMMUNITY"}
          </span>

          <h2>
            {mode === "login"
              ? "Sign in to KI Nexus"
              : "Create your account"}
          </h2>

          <p className="form-description">
            {mode === "login"
              ? "Enter your details to continue to your campus community."
              : "Register to explore and connect with campus communities."}
          </p>

          {/* Login and registration tabs */}
          <div className="auth-tabs">

            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Register
            </button>

          </div>

          {/* Authentication form */}
          <form onSubmit={handleSubmit}>

            {mode === "register" && (
              <>
                <label>Full name</label>

                <div className="input-wrapper">
                  <UserRound size={18} />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <label>Roll number</label>

                <div className="input-wrapper">
                  <GraduationCap size={18} />

                  <input
                    type="text"
                    name="rollNumber"
                    placeholder="Enter your roll number"
                    value={form.rollNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <label>College email</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <label>Password</label>

            <div className="input-wrapper">
              <LockKeyhole size={18} />

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                minLength={mode === "register" ? 8 : undefined}
                required
              />
            </div>

            {/* Success and error messages */}
            {message && (
              <div
                className={`auth-message ${
                  message.includes("successful")
                    ? "success"
                    : "error"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* Switch between login and registration */}
          <p className="login-switch">

            {mode === "login"
              ? "New to KI Nexus?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setMode(
                  mode === "login" ? "register" : "login"
                );

                setMessage("");
              }}
            >
              {mode === "login"
                ? "Create account"
                : "Sign in"}
            </button>

          </p>

          <div className="login-bottom">
            <span>KI NEXUS</span>
            <span>Discover. Connect. Belong.</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
