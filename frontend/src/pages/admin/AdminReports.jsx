import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import AdminLayout from "../../components/layouts/AdminLayout";

function AdminReports() {
  const [stats, setStats] = useState(null);
  const [domainReports, setDomainReports] = useState([]);
  const [questionIssues, setQuestionIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewType, setViewType] = useState("overview");
  const [issueReplyDrafts, setIssueReplyDrafts] = useState({});
  const [issueStatusDrafts, setIssueStatusDrafts] = useState({});
  const [issueUpdatingId, setIssueUpdatingId] = useState(null);

  const normalizeIssueStatus = (status) =>
    typeof status === "string" ? status.trim().toLowerCase() : "open";

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

      const issuesResponse = await axios.get("/admin/question-issues");
      if (issuesResponse.data.status === "success") {
        const issues = issuesResponse.data.data || [];
        setQuestionIssues(issues);

        const replyDraftMap = {};
        const statusDraftMap = {};
        issues.forEach((issue) => {
          replyDraftMap[issue.id] = issue.admin_reply || "";
          statusDraftMap[issue.id] = normalizeIssueStatus(issue.status);
        });
        setIssueReplyDrafts(replyDraftMap);
        setIssueStatusDrafts(statusDraftMap);
      }
    } catch (err) {
      setError("Failed to load reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueUpdate = async (issueId) => {
    const adminReply = (issueReplyDrafts[issueId] || "").trim();
    const status = normalizeIssueStatus(issueStatusDrafts[issueId]);

    if (adminReply.length < 3) {
      setError("Reply should be at least 3 characters.");
      return;
    }

    try {
      setIssueUpdatingId(issueId);
      setError("");

      await axios.put(`/admin/question-issues/${issueId}/reply`, {
        status,
        adminReply,
      });

      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update issue reply");
    } finally {
      setIssueUpdatingId(null);
    }
  };

  const openIssueCount = questionIssues.filter((issue) => normalizeIssueStatus(issue.status) === "open").length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-700">Loading reports...</p>
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
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Analytics & Reports</h1>
              <p className="mt-2 text-slate-600">Track platform performance, pass rates, and domain-level outcomes.</p>
            </div>
            <button
              onClick={fetchReports}
              className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition shadow-lg"
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

        {/* View Type Selector */}
        <div className="flex gap-3 mb-8 bg-white/80 border border-slate-200 rounded-2xl p-2 w-fit">
          <button
            onClick={() => setViewType("overview")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              viewType === "overview"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewType("domains")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              viewType === "domains"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            By Domain
          </button>
          <button
            onClick={() => setViewType("issues")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              viewType === "issues"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Issue Reports {openIssueCount > 0 ? `(${openIssueCount})` : ""}
          </button>
        </div>

        {openIssueCount > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-semibold">
            {openIssueCount} pending question issue report(s) need admin response.
          </div>
        )}

        {viewType === "overview" && stats && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Students */}
              <div className="bg-linear-to-br from-teal-600 to-cyan-700 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-teal-50 text-sm font-semibold mb-2">Total Students</p>
                <p className="text-4xl font-bold">{stats.totalStudents || 0}</p>
                <p className="text-xs text-teal-100 mt-2">Active learners</p>
              </div>

              {/* Total Assessments */}
              <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-emerald-50 text-sm font-semibold mb-2">Assessments Taken</p>
                <p className="text-4xl font-bold">{stats.totalAssessments || 0}</p>
                <p className="text-xs text-emerald-100 mt-2">Total attempts</p>
              </div>

              {/* Pass Rate */}
              <div className="bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-slate-200 text-sm font-semibold mb-2">Pass Rate</p>
                <p className="text-4xl font-bold">
                  {stats.passRate || 0}%
                </p>
                <p className="text-xs text-slate-300 mt-2">Success percentage</p>
              </div>

              {/* Average Score */}
              <div className="bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-amber-50 text-sm font-semibold mb-2">Average Score</p>
                <p className="text-4xl font-bold">
                  {stats.averageScore || 0}%
                </p>
                <p className="text-xs text-amber-50 mt-2">Overall performance</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Domains */}
              <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Total Domains</h3>
                <p className="text-3xl font-bold text-cyan-700">{stats.totalDomains || 0}</p>
                <p className="text-sm text-slate-600 mt-2">
                  Available skill domains in the system
                </p>
              </div>

              {/* Questions */}
              <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Total Questions</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats.totalQuestions || 0}</p>
                <p className="text-sm text-slate-600 mt-2">
                  Questions across all domains
                </p>
              </div>

              {/* Avg Questions per Domain */}
              <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Avg Questions/Domain</h3>
                <p className="text-3xl font-bold text-amber-600">
                  {stats.avgQuestionsPerDomain || 0}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  Average question count per domain
                </p>
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-slate-600 font-semibold mb-2">Expert Level</p>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min((stats.expertCount || 0) / Math.max(stats.totalStudents || 1, 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{stats.expertCount || 0} students</p>
                </div>

                <div>
                  <p className="text-slate-600 font-semibold mb-2">Intermediate Level</p>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600"
                      style={{
                        width: `${Math.min((stats.intermediateCount || 0) / Math.max(stats.totalStudents || 1, 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{stats.intermediateCount || 0} students</p>
                </div>

                <div>
                  <p className="text-slate-600 font-semibold mb-2">Beginner Level</p>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${Math.min((stats.beginnerCount || 0) / Math.max(stats.totalStudents || 1, 1) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{stats.beginnerCount || 0} students</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewType === "domains" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Performance by Domain</h2>
            {domainReports.length === 0 ? (
              <div className="bg-white/90 rounded-3xl shadow-xl p-12 text-center border border-slate-200/70">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Domain Reports Yet</h3>
                <p className="text-slate-600">Students have not completed assessments yet.</p>
              </div>
            ) : (
              domainReports.map((report) => (
                <div
                  key={report.domain_id}
                  className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{report.domain_name}</h3>
                      <p className="text-slate-600 text-sm">ID: {report.domain_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-700">{report.total_attempts || 0}</p>
                      <p className="text-sm text-slate-600">Total attempts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                      <p className="text-slate-600 text-xs font-semibold">Average Score</p>
                      <p className="text-2xl font-bold text-cyan-700">
                        {report.average_score || 0}%
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <p className="text-slate-600 text-xs font-semibold">Pass Rate</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {report.pass_rate || 0}%
                      </p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-600 text-xs font-semibold">Students Attempted</p>
                      <p className="text-2xl font-bold text-slate-700">{report.unique_students || 0}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <p className="text-slate-600 text-xs font-semibold">Highest Score</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {report.highest_score || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {viewType === "issues" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-900">Question Issue Notifications</h2>

            {questionIssues.length === 0 ? (
              <div className="bg-white/90 rounded-3xl shadow-xl p-10 text-center border border-slate-200/70 text-slate-600">
                No issue reports submitted by students yet.
              </div>
            ) : (
              questionIssues.map((issue) => (
                <div key={issue.id} className="bg-white/90 rounded-3xl shadow-xl p-6 border border-slate-200/70">
                  {(() => {
                    const issueStatus = normalizeIssueStatus(issue.status);
                    return (
                      <>
                  <div className="flex flex-wrap justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Report #{issue.id}</p>
                      <p className="text-lg font-bold text-slate-900">{issue.domain_name || "Unknown Domain"}</p>
                      <p className="text-sm text-slate-600">Student: {issue.student_name || "Unknown"} ({issue.student_email || "N/A"})</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${issueStatus === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {issueStatus === "resolved" ? "Resolved" : "Open"}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(issue.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Issue Type</p>
                      <p className="text-sm font-semibold text-slate-800">{issue.issue_type}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Question</p>
                      <p className="text-sm text-slate-700">{issue.question_text || `Question ID: ${issue.question_id}`}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 mb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Student Description</p>
                    <p className="text-sm text-slate-700 leading-6">{issue.description}</p>
                  </div>

                  {issueStatus === "open" ? (
                    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3 items-start">
                      <select
                        value={issueStatusDrafts[issue.id] || "open"}
                        onChange={(e) => setIssueStatusDrafts((prev) => ({ ...prev, [issue.id]: normalizeIssueStatus(e.target.value) }))}
                        className="border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                      </select>

                      <textarea
                        value={issueReplyDrafts[issue.id] || ""}
                        onChange={(e) => setIssueReplyDrafts((prev) => ({ ...prev, [issue.id]: e.target.value }))}
                        placeholder="Send resolution update or custom admin message"
                        rows={3}
                        className="border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />

                      <button
                        onClick={() => handleIssueUpdate(issue.id)}
                        disabled={issueUpdatingId === issue.id}
                        className="bg-linear-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50"
                      >
                        {issueUpdatingId === issue.id ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                      This issue is resolved. Reply controls are hidden.
                    </div>
                  )}

                  {issue.admin_reply && (
                    <div className="mt-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">Latest Admin Reply</p>
                      <p className="text-sm text-emerald-800">{issue.admin_reply}</p>
                      {issue.resolved_at && (
                        <p className="text-xs text-emerald-700 mt-1">
                          Resolved at: {new Date(issue.resolved_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                      </>
                    );
                  })()}
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
