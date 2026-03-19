import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import StudentLayout from "../../components/layouts/StudentLayout";

function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    expertSkills: 0,
  });
  const [domainStrength, setDomainStrength] = useState([]);
  const [issueHistory, setIssueHistory] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    github_link: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          github_link: userData.github_link || "",
        });
      }

      const resultsResponse = await axios.get("/assessment/my-results");
      if (resultsResponse.data.status === "success") {
        const attempts = resultsResponse.data.data || [];
        const averageScore =
          attempts.length > 0
            ? attempts.reduce((sum, item) => sum + parseFloat(item.percentage || 0), 0) / attempts.length
            : 0;

        const bestByDomain = {};
        attempts.forEach((attempt) => {
          const domain = attempt.domain;
          const percentage = parseFloat(attempt.percentage || 0);
          if (!bestByDomain[domain] || percentage > bestByDomain[domain].percentage) {
            bestByDomain[domain] = { percentage, level: attempt.level };
          }
        });

        const expertSkills = Object.values(bestByDomain).filter((d) => d.level === "Expert").length;

        const domainStrengthRows = Object.entries(bestByDomain)
          .map(([domain, data]) => ({
            domain,
            percentage: Number(data.percentage || 0),
            level: data.level || "Fail",
          }))
          .sort((a, b) => b.percentage - a.percentage);

        setStats({
          totalAttempts: attempts.length,
          averageScore,
          expertSkills,
        });
        setDomainStrength(domainStrengthRows);
      }

      const issueResponse = await axios.get("/assessment/my-question-reports");
      if (issueResponse.data.status === "success") {
        setIssueHistory(issueResponse.data.data || []);
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      // Validate
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }

      await axios.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-700">Loading profile...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8 rounded-3xl border border-white/60 bg-white/85 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-7">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-2">Manage your account details and security settings.</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-300 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-linear-to-br from-teal-600 to-cyan-700 p-6 rounded-2xl shadow-lg text-white">
            <p className="text-sm text-teal-100">Total Attempts</p>
            <p className="text-4xl font-bold mt-1">{stats.totalAttempts}</p>
          </div>
          <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
            <p className="text-sm text-emerald-100">Average Score</p>
            <p className="text-4xl font-bold mt-1">{stats.averageScore.toFixed(1)}%</p>
          </div>
          <div className="bg-linear-to-br from-amber-400 to-orange-500 p-6 rounded-2xl shadow-lg text-white">
            <p className="text-sm text-amber-100">Expert Skills</p>
            <p className="text-4xl font-bold mt-1">{stats.expertSkills}</p>
          </div>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Verification Snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-700 font-semibold">Verification Status</p>
              <p className="text-lg font-bold text-cyan-900 mt-1">
                {stats.totalAttempts > 0 ? "Active Learner" : "No Attempts Yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Highest Achievement</p>
              <p className="text-lg font-bold text-emerald-900 mt-1">
                {stats.expertSkills > 0 ? "Expert" : stats.totalAttempts > 0 ? "In Progress" : "Pending"}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-xs uppercase tracking-wide text-violet-700 font-semibold">Assessment Consistency</p>
              <p className="text-lg font-bold text-violet-900 mt-1">
                {stats.averageScore >= 70
                  ? "Strong"
                  : stats.averageScore >= 50
                  ? "Developing"
                  : stats.totalAttempts > 0
                  ? "Needs Focus"
                  : "Not Available"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Domain Strength Matrix</h2>
          {domainStrength.length === 0 ? (
            <p className="text-slate-600">No completed assessments available yet.</p>
          ) : (
            <div className="space-y-4">
              {domainStrength.map((row) => (
                <div key={row.domain} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{row.domain}</p>
                    <span className="text-sm font-bold text-slate-700">
                      {row.percentage.toFixed(2)}% • {row.level}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        row.percentage >= 90
                          ? "bg-emerald-500"
                          : row.percentage >= 70
                          ? "bg-cyan-500"
                          : row.percentage >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(row.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Report/Issue History</h2>
          {issueHistory.length === 0 ? (
            <p className="text-slate-600">You have not reported any question issues yet.</p>
          ) : (
            <div className="space-y-4">
              {issueHistory.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <p className="font-semibold text-slate-900">{item.domain_name}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        item.status === "resolved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">Type: {item.issue_type}</p>
                  <p className="text-sm text-slate-700 mt-1">{item.description}</p>
                  {item.question_text && (
                    <p className="text-xs text-slate-500 mt-2">Question: {item.question_text}</p>
                  )}
                  {item.admin_reply && (
                    <div className="mt-3 rounded-xl bg-cyan-50 border border-cyan-200 p-3">
                      <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Admin Reply</p>
                      <p className="text-sm text-cyan-900 mt-1">{item.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-slate-800 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-5">
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-slate-500 text-sm">Full Name</p>
                  <p className="text-lg font-semibold text-slate-900">{user?.name || "-"}</p>
                </div>
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-slate-500 text-sm">Email Address</p>
                  <p className="text-lg font-semibold text-slate-900">{user?.email || "-"}</p>
                </div>
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-slate-500 text-sm">Account Role</p>
                  <p className="text-lg font-semibold text-cyan-700 capitalize">{user?.role || "student"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">GitHub Profile</p>
                  {formData.github_link ? (
                    <a
                      href={formData.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-cyan-700 hover:underline"
                    >
                      {formData.github_link}
                    </a>
                  ) : (
                    <p className="text-lg font-semibold text-slate-700">Not added</p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    GitHub Profile Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="github_link"
                    value={formData.github_link}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourprofile"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        github_link: user?.github_link || "",
                      });
                    }}
                    className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-semibold hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Security</h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-linear-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition"
                >
                  Change Password
                </button>
              )}
            </div>

            {!isChangingPassword ? (
              <p className="text-slate-600">
                Keep your account secure by updating your password regularly.
              </p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-linear-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-semibold hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default MyProfilePage;
