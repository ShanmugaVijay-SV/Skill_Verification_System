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

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    if (selectedDomain) {
      fetchQuestions(selectedDomain);
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

  const fetchQuestions = async (domainId) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`/questions/admin/${domainId}`);
      if (response.data.status === "success") {
        setQuestions(response.data.data);
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

    if (!validateForm()) {
      return;
    }

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
        }
      }
      setShowForm(false);
      setFormData({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "a",
      });
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
          setQuestions((prev) => prev.filter((q) => q.id !== id));
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
        <h1 className="text-3xl font-bold mb-6">Question Bank</h1>

        {/* Domain Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block font-semibold text-gray-700 mb-3">Select Domain</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomain(domain.id);
                  setShowForm(false);
                  setEditingId(null);
                }}
                className={`p-4 rounded-lg font-semibold transition text-left border-2 ${
                  selectedDomain === domain.id
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
              >
                <div className="font-bold">{domain.name}</div>
                <div className="text-sm opacity-75">{domain.question_count || 0} questions</div>
              </button>
            ))}
          </div>
        </div>

        {selectedDomain && (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mb-6 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
              >
                + Add Question
              </button>
            )}

            {/* Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">
                  {editingId ? "Edit Question" : "Add New Question"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Question <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="question_text"
                      value={formData.question_text}
                      onChange={handleInputChange}
                      placeholder="Enter the question text..."
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["option_a", "option_b", "option_c", "option_d"].map((opt) => (
                      <div key={opt}>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Option {getOptionLabel(opt.split("_")[1])}
                        </label>
                        <input
                          type="text"
                          name={opt}
                          value={formData[opt]}
                          onChange={handleInputChange}
                          placeholder={`Enter option ${getOptionLabel(opt.split("_")[1])}`}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Correct Answer <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-4">
                      {["a", "b", "c", "d"].map((ans) => (
                        <label key={ans} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="correct_answer"
                            value={ans}
                            checked={formData.correct_answer === ans}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">{getOptionLabel(ans)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      {editingId ? "Update Question" : "Add Question"}
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

            {/* Questions List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Questions Yet</h2>
                <p className="text-gray-600 mb-6">Add your first question for this domain.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        Q{index + 1}: {question.question_text}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(question)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                      {["a", "b", "c", "d"].map((opt) => (
                        <div
                          key={opt}
                          className={`p-3 rounded-lg border-2 ${
                            question.correct_answer === opt
                              ? "bg-green-100 border-green-600 font-bold text-green-800"
                              : "bg-gray-100 border-gray-300 text-gray-800"
                          }`}
                        >
                          <span className="font-bold">{getOptionLabel(opt)}.</span> {question[`option_${opt}`]}
                          {question.correct_answer === opt && (
                            <span className="ml-2">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminQuestions;
