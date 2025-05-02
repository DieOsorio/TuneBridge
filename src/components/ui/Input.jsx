const Input = ({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  className,
}) => {

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={"block text-sm text-gray-400 font-medium mb-2"}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        value={type !== "checkbox" ? value : undefined}  // Usa value solo para inputs que no sean checkbox
        checked={type === "checkbox" ? value || false : undefined} // Usa checked para checkboxes
        onChange={onChange}
        className={`w-full px-4 py-2 border border-gray-400 rounded-md ${className}`}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default Input;
