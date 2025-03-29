import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); 

  if (loading) return <p>Cargando...</p>; 
  
  return user && user.email_confirmed_at ? children : <Navigate to="/login" />; 
};

export default ProtectedRoute;
