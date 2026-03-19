import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import AdminLayout from "../../components/layouts/AdminLayout";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/admin/students");
      console.log("Students response:", response.data);
      if (response.data.status === "success") {
        setStudents(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (studentId) => {
    try {
      const response = await axios.get(`/admin/students/${studentId}/results`);
      if (response.data.status === "success") {
        setStudentDetails(response.data.data);
        setSelectedStudent(studentId);
      }
    } catch (err) {
      alert("Failed to load student details");
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score == null || isNaN(score)) return "bg-slate-200 text-slate-700";
    if (score >= 70) return "bg-emerald-100 text-emerald-700";
    if (score >= 50) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  };

  const formatAverageScore = (score) => {
    if (score == null || isNaN(score)) return "N/A";
    return `${parseFloat(score).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-700">Loading students...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8 rounded-3xl border border-white/60 bg-white/85 backdrop-blur-sm shadow-xl shadow-slate-200/60 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Students Management</h1>
              <p className="mt-2 text-slate-600">Review student attempts and drill down into individual assessment history.</p>
            </div>
            <div className="rounded-2xl bg-linear-to-r from-teal-500 to-cyan-600 px-5 py-3 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wide text-teal-100">Total Students</p>
              <p className="text-2xl font-bold leading-tight">{students.length}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 rounded-3xl shadow-xl overflow-hidden border border-slate-200/70">
              <div className="bg-linear-to-r from-slate-900 via-teal-900 to-slate-900 text-white p-6">
                <h2 className="text-xl font-bold">All Students ({students.length})</h2>
                <p className="text-sm text-slate-200 mt-1">Use View Details to inspect domain-wise assessment performance.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wide">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wide">Email</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wide">Attempts</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wide">Avg Score</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr
                          key={student.id}
                          className={`border-b border-slate-100 transition ${
                            selectedStudent === student.id ? "bg-cyan-50/60" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                          <td className="px-6 py-4 text-slate-600">{student.email}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold text-sm">
                              {student.total_attempts || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getScoreBadgeClass(student.avg_score)}`}>
                              {formatAverageScore(student.avg_score)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleViewDetails(student.id)}
                              className={`px-4 py-2 rounded-xl transition font-semibold border ${
                                selectedStudent === student.id
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900"
                            }`}>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                          <p className="text-lg">No students found</p>
                          <p className="text-sm mt-2">Students will appear here once they register</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-1">
            {selectedStudent && studentDetails ? (
              <div className="bg-white/90 rounded-3xl shadow-xl p-6 sticky top-20 border border-slate-200/70">
                <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
                  Student Assessment History
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {studentDetails.length > 0 ? (
                    studentDetails.map((result, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <p className="font-semibold text-slate-800 mb-3">{result.domain_name}</p>
                        <div className="text-sm text-slate-600 space-y-2">
                          <p>
                            Score: <span className="font-bold text-cyan-700">{result.score}/{result.total_questions}</span>
                          </p>
                          <p>
                            Percentage:{" "}
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold ${getScoreBadgeClass(parseFloat(result.percentage))}`}>
                              {result.percentage != null ? parseFloat(result.percentage).toFixed(2) : "N/A"}%
                            </span>
                          </p>
                          <p>Date: {new Date(result.attempt_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 text-center py-4">No assessments yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/90 rounded-3xl shadow-xl p-6 text-center text-slate-600 border border-slate-200/70">
                <p className="text-base font-medium">Select a student to view details</p>
                <p className="text-sm text-slate-500 mt-2">Assessment history will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminStudents;