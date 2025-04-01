import { useEffect, useState } from "react";
import { supabase } from "../../supabase"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Loading from "../../utilis/Loading";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, loading } = useAuth(); // Accedemos al usuario
  const navigate = useNavigate();

  console.log("LOGIN render");
  
  // Si el usuario ya está autenticado, redirigimos a su perfil
  useEffect(() => {
    if (user && user.email_confirmed_at && !loading) {
      navigate(`/profile/${user.user_metadata.username}`); // Redirige a la página del perfil si ya hay un usuario
    }
  }, [user, navigate, loading]);


  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError("No se pudo obtener el ID del usuario.");
    }
    else {
    setError("");
    console.log("Usuario logueado:", data.user);
    }
  }

  if (loading) {
    return <Loading />; 
  }

  return (
    <div className=" text-gray-950 flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <form onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            required
            autoComplete="email"
          />
          
          <Input
            label="Contraseña"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
            autoComplete="current-password"
          />
      
          <Button className="w-full" type="submit">
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
