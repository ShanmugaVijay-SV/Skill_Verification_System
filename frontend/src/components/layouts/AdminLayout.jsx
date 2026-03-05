import SideBarAdmin from "../SideBarAdmin";
import Topbar from "../Topbar";

function AdminLayout({ children }) {
  return (
    <div className="flex">
      <SideBarAdmin />

      <div className="flex-1 ml-64">
        <Topbar />

        <div className="p-6 bg-gray-100 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;