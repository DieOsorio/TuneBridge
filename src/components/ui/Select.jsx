const Select = ({
  id,
  label,
  className = "",
  defaultOption,
  options = [],
  register,
  validation = {},
  error,
  classForLabel = "",
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${classForLabel}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        {...(register ? register(id, validation) : {})}
        className={`w-full px-4 py-2 rounded-md border ${
          error ? "border-red-500" : "border-gray-400"
        } focus:bg-gray-900 ${className}`}
      >
        {defaultOption && <option value="">{defaultOption}</option>}
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error.message || error}
        </p>
      )}
    </div>
  );
};

export default Select;
