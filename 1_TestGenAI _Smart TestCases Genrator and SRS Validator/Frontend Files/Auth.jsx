import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Auth.css";

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:8000`;

export default function Auth2() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          navigate("/prompt", { replace: true });
        }
      } catch (error) {}
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!isLogin && form.password) {
      let strength = 0;
      if (form.password.length >= 8) strength += 20;
      if (/[A-Z]/.test(form.password)) strength += 20;
      if (/[a-z]/.test(form.password)) strength += 20;
      if (/[0-9]/.test(form.password)) strength += 20;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) strength += 20;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [form.password, isLogin]);

  const validateForm = () => {
    const errors = {};

    if (!isLogin && !form.name.trim()) {
      errors.name = "Name is required";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email format";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!isLogin) {
      const hasUpper = /[A-Z]/.test(form.password);
      const hasLower = /[a-z]/.test(form.password);
      const hasNum = /[0-9]/.test(form.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);

      if (!(hasUpper && hasLower && hasNum && hasSpecial)) {
        errors.password = "Password must include uppercase, lowercase, number, and special character";
      }
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErr = errors.name || errors.email || errors.password || errors.confirmPassword || "Please fix the errors below";
      setMessage({ text: firstErr, type: "error" });
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (message.text) {
      setMessage({ text: "", type: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!validateForm()) return;

    setLoading(true);

    try {
      let endpoint, body;

      if (!isLogin) {
        endpoint = `${API_BASE}/api/auth/register`;
        body = JSON.stringify({
          fullName: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        });
      } else {
        endpoint = `${API_BASE}/api/auth/login`;
        body = JSON.stringify({
          email: form.email,
          password: form.password
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Request failed");
      }

      if (!isLogin) {
        setMessage({ text: "Registration successful! Please login.", type: "success" });
        setIsLogin(true);
        setForm(prev => ({
          ...prev,
          name: "",
          password: "",
          confirmPassword: "",
          role: "student"
        }));
      } else {
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate("/prompt", { replace: true }), 1000);
      }

    } catch (error) {
      const msg = error.message || "An error occurred. Please try again.";

      if (msg.includes("Email already exists")) {
        setValidationErrors(prev => ({ ...prev, email: msg }));
        setMessage({ text: msg, type: "error" });
      } else if (msg.includes("Invalid credentials")) {
        setValidationErrors(prev => ({
          ...prev,
          email: "Invalid email or password",
          password: "Invalid email or password"
        }));
        setMessage({ text: "Invalid email or password", type: "error" });
      } else {
        setMessage({ text: msg, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Sign In" : "Create Account"}</h2>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={validationErrors.name ? "error" : ""}
              disabled={loading}
              required
            />
          )}

          {!isLogin && (
            <div className="role-select">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={form.role === "student"}
                  onChange={handleChange}
                  disabled={loading}
                />
                Student
              </label>

              <label>
                <input
                  type="radio"
                  name="role"
                  value="tester"
                  checked={form.role === "tester"}
                  onChange={handleChange}
                  disabled={loading}
                />
                Tester
              </label>

              <label>
                <input
                  type="radio"
                  name="role"
                  value="faculty"
                  checked={form.role === "faculty"}
                  onChange={handleChange}
                  disabled={loading}
                />
                Faculty
              </label>
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={validationErrors.email ? "error" : ""}
            disabled={loading}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={validationErrors.password ? "error" : ""}
            disabled={loading}
            required
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={validationErrors.confirmPassword ? "error" : ""}
              disabled={loading}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading ? (isLogin ? "Logging in..." : "Creating Account...") : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => {
            if (!loading) {
              setIsLogin(!isLogin);
              setMessage({ text: "", type: "" });
              setValidationErrors({});
              setForm(prev => ({
                ...prev,
                name: "",
                password: "",
                confirmPassword: "",
                role: "student"
              }));
            }
          }}>
            {isLogin ? " Register" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
