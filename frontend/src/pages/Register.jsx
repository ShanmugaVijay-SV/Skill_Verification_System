import { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation helpers
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (pwd) => {
    // At least 6 characters, at least one uppercase, one lowercase, one digit
    return pwd.length >= 6;
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, text: "", color: "" };
    
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    const levels = [
      { level: 0, text: "", color: "" },
      { level: 1, text: "Weak", color: "text-red-600" },
      { level: 2, text: "Fair", color: "text-orange-600" },
      { level: 3, text: "Good", color: "text-yellow-600" },
      { level: 4, text: "Strong", color: "text-blue-600" },
      { level: 5, text: "Very Strong", color: "text-green-600" },
      { level: 6, text: "Very Strong", color: "text-green-600" },
    ];

    return levels[strength] || levels[levels.length - 1];
  };

  const validateForm = () => {
    // Name validation
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    // Email validation
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters");
      return false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      setError("Please confirm your password");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/auth/register", {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      if (response.data.status === "success") {
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (!token || !user) {
          throw new Error("Invalid registration response from server");
        }

        // Store token and user info
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect to appropriate dashboard based on role
        const role = user.role;
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        setError(response.data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-950 via-cyan-950 to-amber-950 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.16),_transparent_28%)]"></div>
      <form
        onSubmit={handleRegister}
        className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 relative z-10"
      >
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Create Account
        </h2>
        <p className="text-center text-slate-600 text-sm mb-6">
          Join our skill verification platform
        </p>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-slate-700 font-semibold mb-2">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full p-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-teal-500 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          {name && name.trim().length < 2 && (
            <p className="text-red-500 text-xs mt-1">Name must be at least 2 characters</p>
          )}
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-slate-700 font-semibold mb-2">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-teal-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {email && !isValidEmail(email) && (
            <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-slate-700 font-semibold mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter a strong password"
              className="w-full p-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-teal-500 transition pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-600 hover:text-slate-800"
              disabled={loading}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.level === 1
                        ? "w-1/6 bg-red-500"
                        : passwordStrength.level === 2
                        ? "w-2/6 bg-orange-500"
                        : passwordStrength.level === 3
                        ? "w-3/6 bg-yellow-500"
                        : passwordStrength.level === 4
                        ? "w-4/6 bg-blue-500"
                        : "w-full bg-green-500"
                    }`}
                  ></div>
                </div>
                <span className={`text-xs font-bold ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </span>
              </div>
              <p className="text-xs text-slate-600">Minimum 6 characters required</p>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="mb-6">
          <label className="block text-slate-700 font-semibold mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              className="w-full p-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-teal-500 transition pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-slate-600 hover:text-slate-800"
              disabled={loading}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-300 rounded-xl">
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-teal-500 to-cyan-600 text-white p-3 rounded-xl font-bold hover:from-teal-600 hover:to-cyan-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/" className="text-teal-700 font-bold hover:underline">
            Login here
          </Link>
        </p>

        {/* Terms Notice */}
        <p className="mt-4 text-center text-xs text-slate-500">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
}

export default Register;
