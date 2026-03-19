import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";

function Topbar({ pendingIssueCount = 0 }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div className={`sticky top-0 z-40 h-18 shadow-lg border-b backdrop-blur-sm flex items-center justify-between px-6 ${isAdmin
        ? "bg-linear-to-r from-slate-950 via-teal-900 to-slate-900 border-teal-700/50"
        : "bg-linear-to-r from-slate-950 via-cyan-900 to-slate-900 border-cyan-700/50"
      }`}>

      <h1 className="text-xl font-bold text-white">
        Welcome, <span className="text-amber-300">{user?.name}</span>
      </h1>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white">
            <span className="text-sm text-slate-200">Pending Issues</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900">
              {pendingIssueCount > 99 ? "99+" : pendingIssueCount}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/15 hover:bg-white/20 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Topbar;