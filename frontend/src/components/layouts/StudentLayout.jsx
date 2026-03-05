import SidebarStudent from "../SidebarStudent";
import Topbar from "../Topbar";

function StudentLayout({ children }) {
  return (
    <div className="flex">
      <SidebarStudent />

      <div className="flex-1 ml-64">
        <Topbar />

        <div className="p-6 bg-gray-100 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;