import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsChecked(true);
    }, 1000)
    return() => clearTimeout(timeout);
  }, [loading])

  if (!isChecked) return <p>Cargando...</p>; 
  
  return user && user.email_confirmed_at ? children : <Navigate to="/login" />; 
};

export default ProtectedRoute;
