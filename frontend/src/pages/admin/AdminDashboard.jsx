import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import AdminLayout from "../../components/layouts/AdminLayout";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch stats
      const statsResponse = await axios.get("/admin/stats");
      if (statsResponse.data.status === "success") {
        setStats(statsResponse.data.data);
      }

      // Fetch domains for quick overview
      const domainsResponse = await axios.get("/domains");
      if (domainsResponse.data.status === "success") {
        setDomains(domainsResponse.data.data.slice(0, 5)); // Show top 5
      }
    } catch (err) {
      setError("Failed to load dashboard data");
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
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-700">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8 rounded-3xl border border-white/60 bg-white/85 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-2">Real-time snapshot of student activity, assessments, and system readiness.</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition font-semibold shadow-lg"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-700">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-linear-to-br from-teal-600 to-cyan-700 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-teal-50 text-sm font-semibold mb-2">Total Students</h3>
                <p className="text-4xl font-bold">{stats?.totalStudents || 0}</p>
              </div>
              <div className="text-4xl opacity-70">Users</div>
            </div>
            <p className="text-xs text-teal-50 mt-3">Active in the system</p>
          </div>

          {/* Skills Verified */}
          <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-emerald-50 text-sm font-semibold mb-2">Skills Verified</h3>
                <p className="text-4xl font-bold">{stats?.totalAssessments || 0}</p>
              </div>
              <div className="text-4xl opacity-70">Assess</div>
            </div>
            <p className="text-xs text-emerald-50 mt-3">Total assessments completed</p>
          </div>

          {/* Total Domains */}
          <div className="bg-linear-to-br from-slate-700 to-slate-900 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-slate-200 text-sm font-semibold mb-2">Total Domains</h3>
                <p className="text-4xl font-bold">{stats?.totalDomains || 0}</p>
              </div>
              <div className="text-4xl opacity-70">Skills</div>
            </div>
            <p className="text-xs text-slate-200 mt-3">Available skill domains</p>
          </div>

          {/* Average Score */}
          <div className="bg-linear-to-br from-amber-400 to-orange-500 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-amber-50 text-sm font-semibold mb-2">Average Score</h3>
                <p className="text-4xl font-bold">{stats?.averageScore || 0}%</p>
              </div>
              <div className="text-4xl opacity-70">Score</div>
            </div>
            <p className="text-xs text-amber-50 mt-3">Overall performance</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a
            href="/admin/students"
            className="bg-white/90 p-5 rounded-2xl shadow border border-slate-200 text-center hover:-translate-y-1 hover:shadow-lg transition"
          >
            <p className="font-semibold text-slate-800">Manage Students</p>
            <p className="text-xs text-slate-600 mt-1">View and manage users</p>
          </a>
          <a
            href="/admin/domains"
            className="bg-white/90 p-5 rounded-2xl shadow border border-slate-200 text-center hover:-translate-y-1 hover:shadow-lg transition"
          >
            <p className="font-semibold text-slate-800">Manage Domains</p>
            <p className="text-xs text-slate-600 mt-1">Create and edit skills</p>
          </a>
          <a
            href="/admin/questions"
            className="bg-white/90 p-5 rounded-2xl shadow border border-slate-200 text-center hover:-translate-y-1 hover:shadow-lg transition"
          >
            <p className="font-semibold text-slate-800">Manage Questions</p>
            <p className="text-xs text-slate-600 mt-1">Add assessment items</p>
          </a>
          <a
            href="/admin/reports"
            className="bg-white/90 p-5 rounded-2xl shadow border border-slate-200 text-center hover:-translate-y-1 hover:shadow-lg transition"
          >
            <p className="font-semibold text-slate-800">View Reports</p>
            <p className="text-xs text-gray-600 mt-1">Detailed analytics</p>
          </a>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Domains Overview */}
          <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Skill Domains Overview</h2>
            {domains.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No domains created yet</p>
            ) : (
              <div className="space-y-3">
                {domains.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-800">{domain.name}</p>
                      <p className="text-xs text-slate-600">{domain.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-700">{domain.question_count || 0}</p>
                      <p className="text-xs text-slate-600">Questions</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                  <p className="font-semibold text-slate-800">Server Status</p>
                </div>
                <span className="text-emerald-600 font-bold">Online</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl border border-cyan-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
                  <p className="font-semibold text-slate-800">Database</p>
                </div>
                <span className="text-cyan-700 font-bold">Connected</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <p className="font-semibold text-slate-800">API</p>
                </div>
                <span className="text-amber-700 font-bold">Running</span>
              </div>

              <div className="text-xs text-slate-600 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                All systems operational. Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="bg-linear-to-r from-slate-900 via-teal-900 to-slate-900 rounded-3xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold mb-2">{stats?.totalStudents || 0}</p>
              <p className="text-slate-200">Total Registered Students</p>
            </div>
            <div className="text-center border-l border-r border-teal-700/60">
              <p className="text-5xl font-bold mb-2">{stats?.totalDomains || 0}</p>
              <p className="text-slate-200">Skill Domains Available</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold mb-2">{parseFloat(stats?.averageScore || 0).toFixed(1)}%</p>
              <p className="text-slate-200">Average Student Performance</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
