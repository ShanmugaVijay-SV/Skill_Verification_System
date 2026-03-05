import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDomains from "./pages/admin/AdminDomains";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminReports from "./pages/admin/AdminReports";
import AdminStudents from "./pages/admin/AdminStudents";
import StudentDashboard from "./pages/student/StudentDashboard";
import AssessmentPage from "./pages/student/AssessmentPage";
import ResultsPage from "./pages/student/ResultsPage";
import StudentHistoryPage from "./pages/student/StudentHistoryPage";
import MySkillsPage from "./pages/student/MySkillsPage";
import MyProfilePage from "./pages/student/MyProfilePage";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/domains"
          element={
            <ProtectedRoute role="admin">
              <AdminDomains />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute role="admin">
              <AdminQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <AdminReports />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student/assessment/:domainId"
          element={
            <ProtectedRoute role="student">
              <AssessmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/results"
          element={
            <ProtectedRoute role="student">
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/history"
          element={
            <ProtectedRoute role="student">
              <StudentHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/myskills"
          element={
            <ProtectedRoute role="student">
              <MySkillsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <MyProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
