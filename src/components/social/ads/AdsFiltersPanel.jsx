import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";      
import Input from "../../ui/Input";

export const AdsFiltersPanel = ({ filters, setFilters, placeholder }) => {
  const { control, watch } = useForm({
    defaultValues: { search: filters.search },
  });

  // propagate changes to the parent
  const searchValue = watch("search");
  useEffect(() => {
    setFilters((f) => ({ ...f, search: searchValue }));
  }, [searchValue, setFilters]);

  return (
    <form className="p-4 rounded-lg shadow-md space-y-4">
      <Controller
        control={control}
        name="search"
        render={({ field }) => (
          <Input
            id="search"
            placeholder={placeholder || "Search ads..."}
            className="bg-gray-800"
            register={() => field}
          />
        )}
      />
    </form>
  );
};
