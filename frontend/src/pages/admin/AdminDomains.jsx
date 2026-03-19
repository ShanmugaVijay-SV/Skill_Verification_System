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
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-700">Loading domains...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8 rounded-3xl border border-white/60 bg-white/85 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Skill Domains</h1>
              <p className="mt-2 text-slate-600">Create and maintain the core skill areas used across assessments.</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition shadow-lg"
              >
                New Domain
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white/90 rounded-3xl shadow-xl p-6 mb-8 border border-slate-200/70">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingId ? "Edit Domain" : "Create New Domain"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Domain Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, Python, Data Science"
                  className="w-full p-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-cyan-500"
                  maxLength="100"
                />
                <p className="text-xs text-slate-600 mt-1">
                  {formData.name.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this skill domain..."
                  className="w-full p-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-cyan-500 h-32"
                  maxLength="500"
                />
                <p className="text-xs text-slate-600 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition"
                >
                  {editingId ? "Update Domain" : "Create Domain"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Domains List */}
        {domains.length === 0 ? (
          <div className="bg-white/90 rounded-3xl shadow-xl p-12 text-center border border-slate-200/70">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Domains Yet</h2>
            <p className="text-slate-600 mb-6">Create your first skill domain to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition"
            >
              Create Domain
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70 hover:-translate-y-0.5 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {domain.name}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {domain.description || "No description provided"}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold">
                        Questions: {domain.question_count || 0}
                      </span>
                      <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-semibold">
                        ID: {domain.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(domain)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-slate-800 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(domain.id)}
                      className="bg-rose-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-rose-600 transition"
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
