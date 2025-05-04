const Input = ({
  label,
  id,
  type = "text",
  placeholder,
  required,
  autoComplete,
  className = "",
  error,
  ...rest // Accept additional props (e.g., from react-hook-form's register)
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm text-gray-400 font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-400"
        } rounded-md ${className}`}
        {...rest} // Spread the rest of the props (e.g., {...register("fieldName")})
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
