import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/context/admin/adminRolesActions";

interface Props {
  children: ReactNode;
}

export default function ProtectedAdminRoute({ children }: Props) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) return null;
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}
