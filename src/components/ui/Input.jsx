const Input = ({
  label,
  id,
  type = "text",
  placeholder,
  required,
  autoComplete,
  className = "",
  error,
  register,
  validation = {},
  classForLabel = "",
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${classForLabel}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...(register && register(id, { required, ...validation }))}
        className={`w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-400"
        } rounded-md focus:outline-none focus:ring-2 ${className}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message || error}</p>}
    </div>
  );
};

export default Input;
