import { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Toggle between student and admin
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔐 Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Use correct endpoint based on role
      const endpoint = role === "admin" ? "/auth/admin/login" : "/auth/login";
      
      const response = await axios.post(endpoint, {
        email,
        password,
      });

      // ✅ Store token
      localStorage.setItem("token", response.data.token);

      // ✅ Store user details
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // ✅ Role-based redirect
      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Verification</h1>
          <p className="text-gray-600">Access your account to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Welcome Back
          </h2>

          {/* Role Selector */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                  role === "student"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2.5 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                  role === "admin"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@example.com" : "student@example.com"}
                  required
                />
                <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                role === "admin"
                  ? "bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
                  : "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {role === "student" && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                Create one here
              </Link>
            </p>
          )}
        </form>

        <div className="text-center mt-8 text-xs text-gray-500">
          © 2024 Skill Verification System. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Login;
