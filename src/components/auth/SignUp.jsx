import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Loading from "../../utils/Loading";
import SignUpSuccess from "../../pages/SignUpSuccess";
import { useState } from "react";

const SignUp = () => {
  const { signUp, loading: authLoading, error: authError } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email, password, confirmPassword, username }) => {
    if (password !== confirmPassword) return;

    try {
      await signUp(email, password, username);
      setSuccess(true);
    } catch (err) {
      console.error(err.message);
    }
  };

  if (authLoading) return <Loading />;
  if (success) return <SignUpSuccess />;

  return (
    <div className="text-gray-950 flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>

        {authError && (
          <div className="text-red-500 text-sm mb-4">{authError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="username"
            label="Username"
            placeholder="Your username"
            register={register}
            validation={{
              required: "Username is required",
              maxLength: {
                value: 12,
                message: "Username cannot exceed 12 characters",
              },
              pattern: {
                value: /^[a-zA-Z0-9_.-]+$/,
                message: "Only letters, numbers, underscores, hyphens and dots are allowed",
              },
            }}
            error={errors.username}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="Your email"
            register={register}
            validation={{
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Enter a valid email address",
              },
            }}
            error={errors.email}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Your password"
            register={register}
            validation={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            error={errors.password}
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            register={register}
            validation={{
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            }}
            error={errors.confirmPassword}
          />

          <Button className="w-full" type="submit">
            Sign Up
          </Button>
        </form>

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
