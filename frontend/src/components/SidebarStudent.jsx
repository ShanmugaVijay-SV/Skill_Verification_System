import { Link, useLocation } from "react-router-dom";

function SidebarStudent() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="w-64 h-screen bg-linear-to-b from-slate-900 via-cyan-950 to-slate-950 text-white fixed left-0 top-0 shadow-2xl shadow-cyan-950/30">
      <div className="p-6 text-2xl font-bold border-b border-cyan-900/60">
        Student Panel
      </div>

      <ul className="mt-6 space-y-2 px-4">
        <li>
          <Link
            to="/student/dashboard"
            className={`flex items-center gap-3 p-3 rounded transition ${
              isActive("/student/dashboard")
                ? "bg-cyan-700/70 font-bold border-l-4 border-amber-300"
                : "hover:bg-cyan-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5M5.25 9.75V21h13.5V9.75" />
            </svg>
            <span>Dashboard</span>
          </Link>
        </li>

        <li>
          <Link
            to="/student/myskills"
            className={`flex items-center gap-3 p-3 rounded transition ${
              isActive("/student/myskills")
                ? "bg-cyan-700/70 font-bold border-l-4 border-amber-300"
                : "hover:bg-cyan-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.25h6a2.25 2.25 0 012.25 2.25v11.25h-6A2.25 2.25 0 014.5 16.5V5.25zm15 0h-6a2.25 2.25 0 00-2.25 2.25v11.25h6a2.25 2.25 0 002.25-2.25V5.25z" />
            </svg>
            <span>My Skills</span>
          </Link>
        </li>

        <li>
          <Link
            to="/student/profile"
            className={`flex items-center gap-3 p-3 rounded transition ${
              isActive("/student/profile")
                ? "bg-cyan-700/70 font-bold border-l-4 border-amber-300"
                : "hover:bg-cyan-900/70"
            }`}
          >
            <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0" />
            </svg>
            <span>My Profile</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default SidebarStudent;
