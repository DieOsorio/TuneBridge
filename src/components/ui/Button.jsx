const Button = ({ type = "button", children, onClick, className = "", ...props }) => {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`px-4 py-2 rounded-md cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  