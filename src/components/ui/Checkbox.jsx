const Checkbox = ({ label, id, checked, onChange, className }) => {
    return (
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className={`w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        <label htmlFor={id} className="ml-2 text-sm font-medium">
          {label}
        </label>
      </div>
    );
  };
  
  export default Checkbox;
  