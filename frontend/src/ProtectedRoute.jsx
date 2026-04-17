import { Navigate } from "react-router-dom";

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload?.exp) return false;

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/?session=expired" replace />;
  }

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
