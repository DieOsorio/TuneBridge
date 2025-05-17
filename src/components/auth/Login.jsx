import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Loading from "../../utils/Loading";
import { useForm } from "react-hook-form";

const Login = () => {
  const { user, loading, signIn, error: authError } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (user && user.email_confirmed_at && !loading) {
      navigate(`/profile/${user.id}`);
    }
  }, [user, navigate, loading]);

  const onSubmit = async (data) => {
    try {
      setError("");
      await signIn(data.email, data.password);
    } catch (err) {
      setError("Unable to log in. Please check your credentials.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="text-gray-950 flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Log In</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Your email"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
            })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            autoComplete="current-password"
            {...register("password", {
              required: "Password is required",
            })}
            error={errors.password?.message}
          />

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
