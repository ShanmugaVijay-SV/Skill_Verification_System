import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import AdminLayout from "../../components/layouts/AdminLayout";

function AdminQuestions() {
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "a",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    if (selectedDomain) {
      setCurrentPage(1);
      fetchQuestions(selectedDomain, 1);
    }
  }, [selectedDomain]);

  const fetchDomains = async () => {
    try {
      const response = await axios.get("/domains");
      if (response.data.status === "success") {
        setDomains(response.data.data);
      }
    } catch (err) {
      setError("Failed to load domains");
    }
  };

  const fetchQuestions = async (domainId, page = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`/questions/admin/${domainId}?page=${page}&limit=${itemsPerPage}`);
      if (response.data.status === "success") {
        setQuestions(response.data.data);
        setTotalQuestions(response.data.pagination?.total || response.data.data.length);
      }
    } catch (err) {
      setError("Failed to load questions");
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
    if (!formData.question_text.trim()) {
      setError("Question text is required");
      return false;
    }
    if (!formData.option_a.trim() || !formData.option_b.trim() ||
      !formData.option_c.trim() || !formData.option_d.trim()) {
      setError("All four options are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      const payload = {
        domain_id: parseInt(selectedDomain),
        question_text: formData.question_text.trim(),
        option_a: formData.option_a.trim(),
        option_b: formData.option_b.trim(),
        option_c: formData.option_c.trim(),
        option_d: formData.option_d.trim(),
        correct_answer: formData.correct_answer,
      };

      if (editingId) {
        const response = await axios.put(`/questions/${editingId}`, payload);

        if (response.data.status === "success") {
          setQuestions((prev) =>
            prev.map((q) => (q.id === editingId ? response.data.data : q))
          );
          setEditingId(null);
        }

      } else {
        const response = await axios.post("/questions/add", payload);

        if (response.data.status === "success") {
          setQuestions((prev) => [...prev, response.data.data]);
          setTotalQuestions((prev) => prev + 1);
        }
      }

      setShowForm(false);

      // reset form
      setFormData({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "a",
      });

      fetchQuestions(selectedDomain, currentPage);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    setFormData({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await axios.delete(`/questions/${id}`);
        if (response.data.status === "success") {
          setTotalQuestions((prev) => prev - 1);
          // Refresh questions on current page
          fetchQuestions(selectedDomain, currentPage);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete question");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "a",
    });
    setError("");
  };

  const getOptionLabel = (option) => {
    const labels = { a: "A", b: "B", c: "C", d: "D" };
    return labels[option];
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8 rounded-3xl border border-white/60 bg-white/85 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Question Bank</h1>
              <p className="text-slate-600 mt-2">Manage assessment questions by domain with clear structure and pagination.</p>
            </div>
            {selectedDomain && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition shadow-lg"
              >
                Add New Question
              </button>
            )}
          </div>
        </div>

        {/* Domain Selection */}
        <div className="bg-white/90 rounded-3xl shadow-xl p-8 mb-8 border border-slate-200/70">
          <label className="block font-bold text-slate-800 mb-4 text-lg">Select a Skill Domain</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomain(domain.id);
                  setShowForm(false);
                  setEditingId(null);
                }}
                className={`p-5 rounded-2xl font-semibold transition border text-left ${selectedDomain === domain.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                    : "bg-white text-slate-800 border-slate-200 hover:border-cyan-300 hover:shadow-md"
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs uppercase tracking-wider font-bold ${selectedDomain === domain.id ? "text-slate-200" : "text-slate-500"}`}>
                    Domain
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${selectedDomain === domain.id ? "bg-white/20 text-white" : "bg-cyan-100 text-cyan-700"}`}>
                    {domain.question_count || 0} Q
                  </span>
                </div>
                <div>
                  <div className="font-bold text-lg">{domain.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedDomain && (
          <>
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 font-semibold">
                {error}
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="bg-white/90 rounded-3xl shadow-xl p-8 mb-8 border border-slate-200/70">
                <h2 className="text-3xl font-bold mb-8 text-slate-900">
                  {editingId ? "Edit Question" : "Add New Question"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block font-bold text-slate-700 mb-2 text-lg">
                      Question Text <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="question_text"
                      value={formData.question_text}
                      onChange={handleInputChange}
                      placeholder="Enter the question text..."
                      className="w-full p-4 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 h-24"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-4 text-lg">Options</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["option_a", "option_b", "option_c", "option_d"].map((opt) => (
                        <div key={opt}>
                          <label className="block font-semibold text-slate-700 mb-2">
                            Option {getOptionLabel(opt.split("_")[1])}
                          </label>
                          <input
                            type="text"
                            name={opt}
                            value={formData[opt]}
                            onChange={handleInputChange}
                            placeholder={`Enter option ${getOptionLabel(opt.split("_")[1])}`}
                            className="w-full p-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-4 text-lg">
                      Correct Answer <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-4">
                      {["a", "b", "c", "d"].map((ans) => (
                        <label key={ans} className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-300 transition">
                          <input
                            type="radio"
                            name="correct_answer"
                            value={ans}
                            checked={formData.correct_answer === ans}
                            onChange={handleInputChange}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <span className="font-bold text-lg">{getOptionLabel(ans)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition"
                    >
                      {editingId ? "Update Question" : "Add Question"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-semibold">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white/90 rounded-3xl shadow-xl p-16 text-center border border-slate-200/70">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">No Questions Yet</h2>
                <p className="text-slate-600 mb-6 text-lg">Add your first question for this domain.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition"
                >
                  Create First Question
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-sm font-semibold text-slate-600 mb-4 bg-slate-100 border border-slate-200 p-3 rounded-xl inline-block">
                  Page {currentPage} - Showing <span className="text-cyan-700">{questions.length}</span> of <span className="text-cyan-700">{totalQuestions}</span> total questions
                </div>
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white/90 rounded-3xl shadow-xl transition p-6 border border-slate-200/70"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          <span className="text-cyan-700">Q{index + 1}</span>: {question.question_text}
                        </h3>
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0">
                        <button
                          onClick={() => handleEdit(question)}
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-slate-800 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="bg-rose-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-rose-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="font-semibold text-slate-700 mb-3">Options</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["a", "b", "c", "d"].map((opt) => (
                          <div
                            key={opt}
                            className="p-4 rounded-lg border-2 transition bg-white border-slate-300 text-slate-800"
                          >
                            <span className="font-bold text-lg">{getOptionLabel(opt)}.</span> {question[`option_${opt}`]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalQuestions > itemsPerPage && (
              <div className="flex items-center justify-between mt-8 p-6 bg-white/90 rounded-3xl shadow-xl border border-slate-200/70">
                <p className="font-semibold text-slate-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalQuestions)} of {totalQuestions} questions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      fetchQuestions(selectedDomain, newPage);
                    }}
                    disabled={currentPage === 1}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${currentPage === 1
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2 px-4">
                    {Array.from({ length: Math.ceil(totalQuestions / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          fetchQuestions(selectedDomain, page);
                        }}
                        className={`px-3 py-2 rounded-lg font-semibold transition ${currentPage === page
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const maxPage = Math.ceil(totalQuestions / itemsPerPage);
                      const newPage = currentPage + 1;
                      if (newPage <= maxPage) {
                        setCurrentPage(newPage);
                        fetchQuestions(selectedDomain, newPage);
                      }
                    }}
                    disabled={currentPage >= Math.ceil(totalQuestions / itemsPerPage)}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${currentPage >= Math.ceil(totalQuestions / itemsPerPage)
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminQuestions;
