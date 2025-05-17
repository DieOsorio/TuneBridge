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
    if (password !== confirmPassword) {
      return;
    }

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

        {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Username"
            placeholder="Your username"
            {...register("username", {
              required: "Username is required",
              maxLength: {
                value: 12,
                message: "Username cannot exceed 12 characters",
              },
              pattern: {
                value: /^[a-zA-Z0-9_.-]+$/,
                message: "Only letters, numbers, underscores, hyphens and dots are allowed",
              },
            })}
            error={errors.username?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Your email"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
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
