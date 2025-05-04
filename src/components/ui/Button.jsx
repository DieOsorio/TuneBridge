const Button = ({ type = "button", children, onClick, className = "", ...props }) => {
  
    return (
      <button
        type={type}
        onClick={onClick}
        className={`px-4 py-2 font-bold w-50 rounded-md cursor-pointer bg-sky-600 text-gray-200 hover:bg-sky-700 transition-all ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  