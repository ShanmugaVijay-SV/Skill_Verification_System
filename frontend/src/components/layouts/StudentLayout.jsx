import SidebarStudent from "../SidebarStudent";
import Topbar from "../Topbar";

function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <SidebarStudent />

      <div className="flex-1 ml-64">
        <Topbar />

        <div className="p-6 min-h-screen bg-linear-to-br from-teal-50 via-white to-amber-50/40">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;