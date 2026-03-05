import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import AdminLayout from "../../components/layouts/AdminLayout";

function AdminDomains() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/domains");
      if (response.data.status === "success") {
        setDomains(response.data.data);
      }
    } catch (err) {
      setError("Failed to load domains");
      console.error(err);
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
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Domain name is required");
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError("Domain name must be at least 2 characters");
      return false;
    }
    if (formData.name.trim().length > 100) {
      setError("Domain name must be less than 100 characters");
      return false;
    }
    if (formData.description.length > 500) {
      setError("Description must be less than 500 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        // Update existing domain
        const response = await axios.put(`/domains/${editingId}`, {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        if (response.data.status === "success") {
          setDomains((prev) =>
            prev.map((d) => (d.id === editingId ? response.data.data : d))
          );
          setEditingId(null);
          setShowForm(false);
          setFormData({ name: "", description: "" });
        }
      } else {
        // Create new domain
        const response = await axios.post("/domains", {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        if (response.data.status === "success") {
          setDomains((prev) => [...prev, response.data.data]);
          setShowForm(false);
          setFormData({ name: "", description: "" });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save domain");
    }
  };

  const handleEdit = (domain) => {
    setEditingId(domain.id);
    setFormData({
      name: domain.name,
      description: domain.description,
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this domain?")) {
      try {
        const response = await axios.delete(`/domains/${id}`);
        if (response.data.status === "success") {
          setDomains((prev) => prev.filter((d) => d.id !== id));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete domain");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setError("");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading domains...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Skill Domains</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
            >
              + New Domain
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Edit Domain" : "Create New Domain"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Domain Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, Python, Data Science"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  maxLength="100"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.name.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this skill domain..."
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-32"
                  maxLength="500"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  {editingId ? "Update Domain" : "Create Domain"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Domains List */}
        {domains.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Domains Yet</h2>
            <p className="text-gray-600 mb-6">Create your first skill domain to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Create Domain
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {domain.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {domain.description || "No description provided"}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                        Questions: {domain.question_count || 0}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                        ID: {domain.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(domain)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(domain.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDomains;
