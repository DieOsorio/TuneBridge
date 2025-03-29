import { Link } from "react-router-dom";

const SignUpSuccess = () => {

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <div className="max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          ¡Registro exitoso!
        </h2>
        <p className="text-gray-700">
          Se ha enviado un correo de confirmación a tu dirección de email.  
          Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.
        </p>
        <p className="text-gray-600 text-sm mt-2">
          Si no lo encuentras, revisa la carpeta de spam.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition"
        >
          Home
        </Link>
      </div>
    </div>
  );
};

export default SignUpSuccess;
