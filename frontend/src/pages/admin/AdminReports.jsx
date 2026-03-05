import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import AdminLayout from "../../components/layouts/AdminLayout";

function AdminReports() {
  const [stats, setStats] = useState(null);
  const [domainReports, setDomainReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewType, setViewType] = useState("overview");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch dashboard stats
      const statsResponse = await axios.get("/admin/stats");
      if (statsResponse.data.status === "success") {
        setStats(statsResponse.data.data);
      }

      // Fetch domain reports
      const reportsResponse = await axios.get("/admin/reports/domains");
      if (reportsResponse.data.status === "success") {
        setDomainReports(reportsResponse.data.data);
      }
    } catch (err) {
      setError("Failed to load reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <button
            onClick={fetchReports}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* View Type Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewType("overview")}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              viewType === "overview"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewType("domains")}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              viewType === "domains"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            By Domain
          </button>
        </div>

        {viewType === "overview" && stats && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Students */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">Total Students</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalStudents || 0}</p>
                <p className="text-xs text-gray-500 mt-2">Active learners</p>
              </div>

              {/* Total Assessments */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">Assessments Taken</p>
                <p className="text-4xl font-bold text-green-600">{stats.totalAssessments || 0}</p>
                <p className="text-xs text-gray-500 mt-2">Total attempts</p>
              </div>

              {/* Pass Rate */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">Pass Rate</p>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.passRate || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Success percentage</p>
              </div>

              {/* Average Score */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">Average Score</p>
                <p className="text-4xl font-bold text-orange-600">
                  {stats.averageScore || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Overall performance</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Domains */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Total Domains</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalDomains || 0}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Available skill domains in the system
                </p>
              </div>

              {/* Questions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Total Questions</h3>
                <p className="text-3xl font-bold text-green-600">{stats.totalQuestions || 0}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Questions across all domains
                </p>
              </div>

              {/* Avg Questions per Domain */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Avg Questions/Domain</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.avgQuestionsPerDomain || 0}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Average question count per domain
                </p>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 font-semibold mb-2">Expert Level</p>
                  <div className="w-full h-12 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${Math.min((stats.expertCount || 0) / Math.max(stats.totalStudents || 1, 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{stats.expertCount || 0} students</p>
                </div>

                <div>
                  <p className="text-gray-600 font-semibold mb-2">Intermediate Level</p>
                  <div className="w-full h-12 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{
                        width: `${Math.min((stats.intermediateCount || 0) / Math.max(stats.totalStudents || 1, 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{stats.intermediateCount || 0} students</p>
                </div>

                <div>
                  <p className="text-gray-600 font-semibold mb-2">Beginner Level</p>
                  <div className="w-full h-12 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-600"
                      style={{
                        width: `${Math.min((stats.beginnerCount || 0) / Math.max(stats.totalStudents || 1, 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{stats.beginnerCount || 0} students</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewType === "domains" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance by Domain</h2>
            {domainReports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Domain Reports Yet</h3>
                <p className="text-gray-600">Students haven't completed assessments yet.</p>
              </div>
            ) : (
              domainReports.map((report) => (
                <div
                  key={report.domain_id}
                  className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{report.domain_name}</h3>
                      <p className="text-gray-600 text-sm">ID: {report.domain_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{report.total_attempts || 0}</p>
                      <p className="text-sm text-gray-600">Total attempts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-xs font-semibold">Average Score</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {report.average_score || 0}%
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-xs font-semibold">Pass Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {report.pass_rate || 0}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-xs font-semibold">Students Attempted</p>
                      <p className="text-2xl font-bold text-purple-600">{report.unique_students || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-xs font-semibold">Highest Score</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {report.highest_score || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminReports;
