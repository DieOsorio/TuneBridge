const Input = ({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}) => {

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        value={type !== "checkbox" ? value : undefined}  // Usa value solo para inputs que no sean checkbox
        checked={type === "checkbox" ? value || false : undefined} // Usa checked para checkboxes
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-md"
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default Input;
