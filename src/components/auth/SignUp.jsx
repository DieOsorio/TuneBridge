import { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "../../pages/Loading";
import { supabase } from "../../supabase";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { username, session } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (session && session.user.email_confirmed_at) {
      navigate(`/profile/${session.user.id}`);
    }
  }, [session, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      console.log("SignUp data:", data); // Verifica qué contiene el data
      console.log("SignUp error:", error); // Verifica si hay error
  
      if (error) {
        setError(error.message);
        return;
      } else {
        setError("");
        setSuccess(true);
  
        if (data.user) {
          // Verificar si data.user está presente antes de continuar
          console.log("User:", data.user);  // Verifica el usuario antes de insertarlo
          
          const { error: profileError } = await supabase
          .from("profiles")
          .insert([{
            id: data.user.id,
            username: username,
            avatar_url: "",
            instrument: "",
            is_singer: false,
            is_composer: false,
            birthdate: null,
            gender: "",
            email: email
          },
          ])
          .select();
  
          if (profileError) {
            console.log("Profile creation error:", profileError);
            setError("Hubo un error al crear el perfil");
            return;
          }
        }
  
        navigate(`/signup-success`);
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
      setError("Hubo un problema al registrarte.");
    }
  };

  if (!session && success) {
    return <Loading />;
  }

  return (
    <div className="text-gray-950 flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Registrarse</h2>

        {success && (
          <div className="text-green-500 text-sm mb-4">
            ¡Registro exitoso! Revisa tu correo para verificar tu cuenta.
          </div>
        )}
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSignUp}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            required
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma tu contraseña"
            required
            autoComplete="new-password"
          />
          <Button className="w-full" type="submit">
            Registrarse
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
