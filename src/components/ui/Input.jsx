
const Input = ({ label, id, type, value, onChange, placeholder, required, autoComplete }) => {
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
        value={value}
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
