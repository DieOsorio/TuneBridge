const Button = ({ type = "button", children, onClick, className = "", ...props }) => {
  console.log("BUTTON render");
  
    return (
      <button
        type={type}
        onClick={onClick}
        className={`px-4 py-2 font-bold w-50 rounded-md cursor-pointer bg-blue-300 text-gray-900 hover:bg-gray-300 transition-all ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  