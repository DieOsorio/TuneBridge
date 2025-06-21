import { useController } from "react-hook-form";

const Select = ({
  id,
  name,
  label,
  className = "",
  defaultOption,
  options = [],
  register,
  validation = {},
  error,
  classForLabel = "",
  value,
  onChange,
  control, // 🔹 NUEVO: soporte opcional para useController
}) => {
  // 🔹 Solo usamos useController si se pasó control y name
  const controller = control && name
    ? useController({ name, control, rules: validation })
    : null;

  const selectValue = controller ? controller.field.value : value;
  const selectOnChange = controller ? controller.field.onChange : onChange;
  const selectRegister = controller ? {} : (register ? register(id || name, validation) : {});
  const selectError = controller ? controller.fieldState?.error : error;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${classForLabel}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        name={name || id}
        {...selectRegister}
        className={`w-full px-4 py-2 rounded-md border ${
          selectError ? "border-red-500" : "border-gray-400"
        } focus:bg-gray-900 ${className}`}
        value={selectValue !== undefined ? selectValue : ""}
        onChange={selectOnChange}
      >
        {defaultOption && <option value="">{defaultOption}</option>}
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {selectError && (
        <p className="text-red-500 text-sm mt-1">
          {selectError.message || selectError}
        </p>
      )}
    </div>
  );
};

export default Select;
