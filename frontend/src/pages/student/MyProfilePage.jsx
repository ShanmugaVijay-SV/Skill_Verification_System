import { useState, useEffect } from "react";
import axios from "axios";
import StudentLayout from "../../components/layouts/StudentLayout";

function MyProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    github_link: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Get user from localStorage (set during login)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          github_link: userData.github_link || ""
        });
      }
      
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      
      // For now, just update localStorage
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

      const token = localStorage.getItem("token");
      
      // Make API call to change password
      const response = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsChangingPassword(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`;
    navigator.clipboard.writeText(profileUrl);
    setSuccess("Profile link copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and personal information</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Profile Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <p className="text-gray-600 text-sm">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                </div>
                <div className="border-b pb-3">
                  <p className="text-gray-600 text-sm">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>
                <div className="border-b pb-3">
                  <p className="text-gray-600 text-sm">Account Role</p>
                  <p className="text-lg font-semibold text-blue-600 capitalize">{user?.role}</p>
                </div>
                {formData.github_link && (
                  <div className="border-b pb-3">
                    <p className="text-gray-600 text-sm">GitHub Profile</p>
                    <a
                      href={formData.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {formData.github_link}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Profile Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="github_link"
                    value={formData.github_link}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Profile Sharing */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Profile</h2>
            <p className="text-gray-600 mb-4">
              Share your skill profile with others to showcase your verified skills and certifications.
            </p>
            <button
              onClick={handleShareProfile}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>📋</span> Copy Profile Link
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Security</h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  Change Password
                </button>
              )}
            </div>

            {!isChangingPassword ? (
              <p className="text-gray-600">
                Click the "Change Password" button to update your password. We recommend changing your password regularly for security.
              </p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
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
