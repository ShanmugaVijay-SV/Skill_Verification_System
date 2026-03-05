import { Link } from "react-router-dom";

function SidebarStudent() {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-blue-700">
        Student Panel
      </div>

      <ul className="mt-6 space-y-2 px-4">
        <li>
          <Link
            to="/student/dashboard"
            className="block p-3 rounded hover:bg-blue-700"
          >
            🏠 Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/student/myskills"
            className="block p-3 rounded hover:bg-blue-700"
          >
            📚 My Skills
          </Link>
        </li>

        <li>
          <Link
            to="/student/profile"
            className="block p-3 rounded hover:bg-blue-700"
          >
            👤 My Profile
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default SidebarStudent;
