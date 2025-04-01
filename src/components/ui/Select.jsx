const Select = ({ value, onChange, id, label, className, defaultOption, option1, option2, option3, ...props }) => {
  console.log("SELECT render");
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label}
        </label>
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        >
          <option>{defaultOption}</option>
          <option>{option1}</option>
          <option>{option2}</option>
          <option>{option3}</option>
        </select>
      </div>
    );
  };
  
  export default Select;
  