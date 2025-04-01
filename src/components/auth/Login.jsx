import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Loading from "../../utilis/Loading";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, loading, signIn, error: authError } = useAuth(); // Access signIn and authError from AuthContext
  const navigate = useNavigate();

  // Redirect to the user's profile if already authenticated
  useEffect(() => {
    if (user && user.email_confirmed_at && !loading) {
      navigate(`/profile/${user.id}`); // Redirect to the profile page
      console.log("User is authenticated, redirecting to profile page.");   
    }
  }, [user, navigate, loading]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError(""); // Clear any previous errors
      await signIn(email, password); // Use the signIn function from AuthContext
    } catch (err) {
      setError("No se pudo iniciar sesión. Verifica tus credenciales.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className=" text-gray-950 flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}

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
