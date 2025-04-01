import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../utilis/Loading";
import SignUpSuccess from "../../pages/SignUpSuccess";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signIn, loading: authLoading, error: authError } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      // Sign up the user
      const { error: signUpError } = await signIn(email, password);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Clear error and set success
      setError("");
      setSuccess(true);
    } catch (err) {
      setError("Hubo un problema al registrarte.");
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (success) {
    return <SignUpSuccess />;
  }

  return (
    <div className="text-gray-950 flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Registrarse</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}

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
