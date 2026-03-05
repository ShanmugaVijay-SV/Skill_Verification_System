import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      
      <h1 className="text-xl font-semibold">
        Welcome, {user?.name}
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}

export default Topbar;