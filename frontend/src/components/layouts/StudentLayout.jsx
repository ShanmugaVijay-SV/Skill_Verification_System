import SidebarStudent from "../SidebarStudent";
import Topbar from "../Topbar";

function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-transparent overflow-x-hidden">
      <SidebarStudent />

      <div className="ml-64 w-[calc(100%-16rem)] min-w-0">
        <Topbar />

        <div className="p-6 pt-18 min-h-screen bg-linear-to-br from-teal-50 via-white to-amber-50/40">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;