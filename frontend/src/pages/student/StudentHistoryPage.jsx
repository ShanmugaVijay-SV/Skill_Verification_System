import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentLayout from "../../components/layouts/StudentLayout";

function StudentHistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/assessment/my-results");
      if (response.data.status === "success") {
        setResults(response.data.data);
      }
    } catch (err) {
      setError("Failed to load assessment history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (passed) => {
    return passed ? (
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
        ✓ Passed
      </span>
    ) : (
      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
        ⚠ Attempted
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const badges = {
      Expert: "bg-green-100 text-green-800",
      Intermediate: "bg-blue-100 text-blue-800",
      Beginner: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${badges[level] || ""}`}>
        {level}
      </span>
    );
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 font-bold";
    if (percentage >= 60) return "text-blue-600 font-bold";
    return "text-orange-600 font-bold";
  };

  const filteredResults =
    filter === "all"
      ? results
      : filter === "passed"
      ? results.filter((r) => r.result === "Pass")
      : results.filter((r) => r.result === "Fail");

  const stats = {
    total: results.length,
    passed: results.filter((r) => r.result === "Pass").length,
    avgScore:
      results.length > 0
        ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length).toFixed(2)
        : 0,
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading history...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Assessment History</h1>
            <p className="text-gray-600">View your past assessment attempts and results</p>
          </div>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm mb-2">Total Attempts</p>
              <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
              <p className="text-gray-600 text-sm mb-2">Passed</p>
              <p className="text-4xl font-bold text-green-600">{stats.passed}</p>
              <p className="text-sm text-gray-600 mt-2">
                {((stats.passed / stats.total) * 100).toFixed(0)}% Success Rate
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm mb-2">Average Score</p>
              <p className="text-4xl font-bold text-purple-600">{stats.avgScore}%</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Assessment History</h2>
            <p className="text-gray-600 mb-6">
              You haven't attempted any assessments yet. Start by selecting a skill domain!
            </p>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Filter Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setFilter("passed")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === "passed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Passed ({results.filter((r) => r.result === "Pass").length})
              </button>
              <button
                onClick={() => setFilter("failed")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === "failed"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Attempted ({results.filter((r) => r.result !== "Pass").length})
              </button>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Domain</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Score</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Percentage</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Level</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">{result.domain}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-blue-600">
                            {result.score}/{result.total}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-center ${getPercentageColor(parseFloat(result.percentage))}`}>
                          {result.percentage}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getLevelBadge(result.level)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(result.result === "Pass")}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(result.attemptDate).toLocaleDateString()} at{" "}
                            {new Date(result.attemptDate).toLocaleTimeString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}

export default StudentHistoryPage;
