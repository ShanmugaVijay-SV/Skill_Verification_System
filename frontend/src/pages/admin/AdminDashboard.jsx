import AdminLayout from "../../components/layouts/AdminLayout";

function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          Total Students
        </div>
        <div className="bg-white p-6 rounded shadow">
          Skills Verified
        </div>
        <div className="bg-white p-6 rounded shadow">
          Pending Requests
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
