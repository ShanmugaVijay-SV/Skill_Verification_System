import { Link } from "react-router-dom";

function SidebarAdmin() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>

      <ul className="mt-6 space-y-2 px-4">
        <li>
          <Link
            to="/admin/dashboard"
            className="block p-3 rounded hover:bg-gray-700 transition font-semibold text-gray-100"
          >
            📊 Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/admin/students"
            className="block p-3 rounded hover:bg-gray-700 transition font-semibold text-gray-100"
          >
            👨‍🎓 Students
          </Link>
        </li>

        <li>
          <Link
            to="/admin/domains"
            className="block p-3 rounded hover:bg-gray-700 transition font-semibold text-gray-100"
          >
            📚 Domains
          </Link>
        </li>

        <li>
          <Link
            to="/admin/questions"
            className="block p-3 rounded hover:bg-gray-700 transition font-semibold text-gray-100"
          >
            ❓ Questions
          </Link>
        </li>

        <li>
          <Link
            to="/admin/reports"
            className="block p-3 rounded hover:bg-gray-700 transition font-semibold text-gray-100"
          >
            📈 Reports
          </Link>
        </li>
      </ul>

      <div className="absolute bottom-6 left-4 right-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">Skill Verification System v1.0</p>
      </div>
    </div>
  );
}

export default SidebarAdmin;
