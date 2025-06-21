const Input = ({
  label,
  id,
  type = "text",
  placeholder,
  required,
  autoComplete,
  className = "",
  maxLength,
  error,
  register,
  validation = {},
  classForLabel = "",
}) => {
  const isInline = className.includes("!flex-1"); // 🔹 detectar uso horizontal

  return (
    <div className={isInline ? "flex-1" : "mb-4"}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${classForLabel}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        {...(register && register(id, { required, ...validation }))}
        className={`px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-400"
        } rounded-md focus:outline-none focus:ring-2 w-full ${className}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message || error}</p>}
    </div>
  );
};

export default Input;