import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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
    <nav className="bg-linear-to-r from-slate-950 via-teal-900 to-slate-900 shadow-lg border-b border-teal-700/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo / Title */}
        <h1 className="text-2xl font-bold text-white tracking-wide">
          🚀 Skill Verification System
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          <span className="text-slate-100 text-lg">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </span>

          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl border border-white/15 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
