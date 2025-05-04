import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../utils/Loading";
import SignUpSuccess from "../../pages/SignUpSuccess";

const SignUp = () => {
  const { signIn, loading: authLoading, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
      setError("There was a problem signing you up.");
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
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}

        <form onSubmit={handleSignUp}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
          />
          <Button className="w-full" type="submit">
            Sign Up
          </Button>
        </form>

        {/* Suggestion to log in */}
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
