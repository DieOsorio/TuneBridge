import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../utils/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsChecked(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [loading]);

  if (!isChecked) return <Loading />;

  return user && user.email_confirmed_at ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
