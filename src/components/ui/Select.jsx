const Select = ({ value, onChange, id, label, className, defaultOption, options = [], ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-400 text-sm font-medium mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-md border border-gray-400 focus:bg-gray-900 ${className}`}
        {...props}
      >
        {/* Default Option */}
        {defaultOption && <option value="">{defaultOption}</option>}

        {/* Dynamically Render Options */}
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
