import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ Not logged in
  if (!token || !user) {
    return <Navigate to="/" />;
  }

  // ❌ Role mismatch
 if (role && user.role !== role) {
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <Navigate to="/student/dashboard" />;
  }
}

  return children;
}

export default ProtectedRoute;
