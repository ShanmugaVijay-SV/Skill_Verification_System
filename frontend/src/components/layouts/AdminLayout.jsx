import { useCallback, useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import SideBarAdmin from "../SideBarAdmin";
import Topbar from "../Topbar";

function AdminLayout({ children }) {
  const [pendingIssueCount, setPendingIssueCount] = useState(0);

  const fetchPendingIssueCount = useCallback(async () => {
    try {
      const response = await axios.get("/admin/question-issues", {
        params: { status: "open" },
      });

      setPendingIssueCount(Array.isArray(response.data.data) ? response.data.data.length : 0);
    } catch (error) {
      console.error("Unable to fetch pending issue count:", error);
    }
  }, []);

  useEffect(() => {
    fetchPendingIssueCount();
    
    // Refresh pending issue count every 5 seconds
    const interval = setInterval(() => {
      fetchPendingIssueCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchPendingIssueCount]);

  return (
    <div className="flex min-h-screen bg-transparent overflow-x-hidden">
      <SideBarAdmin pendingIssueCount={pendingIssueCount} />

      <div className="ml-64 w-[calc(100%-16rem)] min-w-0">
        <Topbar pendingIssueCount={pendingIssueCount} />

        <div className="p-6 pt-18 min-h-screen bg-linear-to-br from-cyan-50 via-white to-amber-50/40">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;