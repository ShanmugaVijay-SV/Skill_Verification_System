import { Link, useLocation } from "react-router-dom";

function SidebarAdmin({ pendingIssueCount = 0 }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="w-64 h-screen bg-linear-to-b from-slate-900 via-teal-950 to-slate-950 text-white fixed left-0 top-0 shadow-2xl shadow-teal-950/30">
      <div className="p-6 text-2xl font-bold border-b border-teal-900/60">
        Admin Panel
      </div>

      <ul className="mt-6 space-y-2 px-4">
        <li>
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-3 p-3 rounded transition font-semibold ${
              isActive("/admin/dashboard")
                ? "bg-teal-700/70 text-white border-l-4 border-amber-300"
                : "hover:bg-teal-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5h15M7.5 16.5v-6m4.5 6V7.5m4.5 9v-3" />
            </svg>
            <span>Dashboard</span>
          </Link>
        </li>

        <li>
          <Link
            to="/admin/students"
            className={`flex items-center gap-3 p-3 rounded transition font-semibold ${
              isActive("/admin/students")
                ? "bg-teal-700/70 text-white border-l-4 border-amber-300"
                : "hover:bg-teal-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5l8.25 4.5L12 13.5 3.75 9 12 4.5zm-5.25 7.5v3.75A6.75 6.75 0 0012 20.25a6.75 6.75 0 005.25-4.5V12" />
            </svg>
            <span>Students</span>
          </Link>
        </li>

        <li>
          <Link
            to="/admin/domains"
            className={`flex items-center gap-3 p-3 rounded transition font-semibold ${
              isActive("/admin/domains")
                ? "bg-teal-700/70 text-white border-l-4 border-amber-300"
                : "hover:bg-teal-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.25h6a2.25 2.25 0 012.25 2.25v11.25h-6A2.25 2.25 0 014.5 16.5V5.25zm15 0h-6a2.25 2.25 0 00-2.25 2.25v11.25h6a2.25 2.25 0 002.25-2.25V5.25z" />
            </svg>
            <span>Domains</span>
          </Link>
        </li>

        <li>
          <Link
            to="/admin/questions"
            className={`flex items-center gap-3 p-3 rounded transition font-semibold ${
              isActive("/admin/questions")
                ? "bg-teal-700/70 text-white border-l-4 border-amber-300"
                : "hover:bg-teal-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9a2.25 2.25 0 114.5 0c0 1.035-.692 1.56-1.384 2.068-.693.508-1.366.99-1.366 1.932M12 16.5h.008" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Questions</span>
          </Link>
        </li>

        <li>
          <Link
            to="/admin/reports"
            className={`flex items-center gap-3 p-3 rounded transition font-semibold ${
              isActive("/admin/reports")
                ? "bg-teal-700/70 text-white border-l-4 border-amber-300"
                : "hover:bg-teal-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 19.5h16.5M6.75 16.5l3-3 2.25 2.25 4.5-4.5" />
            </svg>
            <span>Reports</span>
            {pendingIssueCount > 0 && (
              <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900 shadow-sm">
                {pendingIssueCount > 99 ? "99+" : pendingIssueCount}
              </span>
            )}
          </Link>
        </li>
      </ul>

      <div className="absolute bottom-6 left-4 right-4 pt-4 border-t border-teal-900/60">
        <p className="text-xs text-slate-300 text-center">Skill Verification System v1.0</p>
      </div>
    </div>
  );
}

export default SidebarAdmin;
