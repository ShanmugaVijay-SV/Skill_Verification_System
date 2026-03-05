import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-linear-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold text-white tracking-wide">
          🚀 Skill Verification System
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          <span className="text-white text-lg">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
