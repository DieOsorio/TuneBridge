import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminRoles } from "@/context/admin/AdminRolesContext";

import AdminNav from "./ui/AdminNav";
import RolesSection from "./roles/RolesSection";
import ReportsSection from "./reports/ReportsSection";
import FeedbackSection from "./feedback/FeedbackSection";
import BansSection from "./bans/BansSection";
import LogsSection from "./logs/LogsSection";

export default function AdminDashboard() {
  const { user } = useAuth();
    const { adminRolesQuery } = useAdminRoles();
    const { data: role } = adminRolesQuery( user?.id ?? "" );
  
    const isAdmin = role?.role === "admin";
    const isModerator = role?.role === "moderator";
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <AdminNav />
      <div className="flex-1 overflow-auto p-4 space-y-8">
        <Routes>
          <Route index element={<RolesSection isAdmin={isAdmin} isModerator={isModerator} />} />
          <Route path="roles" element={<RolesSection isAdmin={isAdmin} isModerator={isModerator} />} />
          <Route path="reports" element={<ReportsSection isAdmin={isAdmin} isModerator={isModerator} />} />
          <Route path="feedback" element={<FeedbackSection isAdmin={isAdmin} isModerator={isModerator} />} />
          <Route path="bans" element={<BansSection currentAdminId={user?.id ?? ""} isAdmin={isAdmin} isModerator={isModerator} />} />
          <Route path="logs" element={<LogsSection isAdmin={isAdmin} isModerator={isModerator} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}
