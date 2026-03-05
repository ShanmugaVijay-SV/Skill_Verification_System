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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading students...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Students Management</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-6">
                <h2 className="text-xl font-bold">All Students ({students.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Attempts</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Avg Score</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-semibold text-gray-800">{student.name}</td>
                          <td className="px-6 py-4 text-gray-700">{student.email}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                              {student.total_attempts || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full font-semibold ${
                              student.avg_score >= 70 ? "bg-green-100 text-green-800" :
                              student.avg_score >= 50 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {student.avg_score != null && !isNaN(student.avg_score) ? parseFloat(student.avg_score).toFixed(2) : "N/A"}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleViewDetails(student.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
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
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b-2 border-blue-600">
                  Assessment History
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {studentDetails.length > 0 ? (
                    studentDetails.map((result, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-800 mb-2">{result.domain_name}</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Score: <span className="font-bold text-blue-600">{result.score}/{result.total_questions}</span></p>
                          <p>Percentage: <span className={`font-bold ${parseFloat(result.percentage) >= 70 ? "text-green-600" : parseFloat(result.percentage) >= 50 ? "text-yellow-600" : "text-red-600"}`}>{result.percentage != null ? parseFloat(result.percentage).toFixed(2) : "N/A"}%</span></p>
                          <p>Date: {new Date(result.attempt_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">No assessments yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-600">
                <p>Select a student to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminStudents;