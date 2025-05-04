import { Link } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";

const SignUpSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-center px-4">
      <div className="max-w-md bg-gray-800 shadow-lg rounded-lg p-10">
        <div className="flex justify-center mb-4">
          <AiOutlineCheckCircle className="text-green-500" size={50} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">
          Registration Successful!
        </h2>
        <p className="text-gray-300">
          A confirmation email has been sent to your email address.  
          Please check your inbox and follow the instructions to activate your account.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          If you don't see it, check your spam folder.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default SignUpSuccess;
