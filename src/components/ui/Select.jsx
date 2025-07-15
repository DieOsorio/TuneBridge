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
  control,
  value,
  onChange 
}) => {
  const fieldName = name || id;

  const controller = control && fieldName
    ? useController({ name: fieldName, control, rules: validation })
    : null;

  const selectProps = controller
    ? {
        name: controller.field.name,
        value: controller.field.value || "",
        onChange: controller.field.onChange,
      }
    : value !== undefined && onChange !== undefined
    ? {
        name: fieldName,
        value,
        onChange,
      }
    : {
        ...register(fieldName, validation),
      };

  const selectError = controller ? controller.fieldState?.error : error;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={`block text-sm font-bold text-gray-200 mb-2 ${classForLabel}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        {...selectProps}
        className={`w-full px-4 py-2 rounded-md border ${
          selectError ? "border-red-500" : "border-gray-400"
        } focus:bg-gray-900 ${className}`}
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
