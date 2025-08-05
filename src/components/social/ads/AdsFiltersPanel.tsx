import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Filters } from "@/context/social/adsActions";

import Input from "@/components/ui/Input";



interface AdsFiltersPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  placeholder?: string;
}

interface FormValues {
  search: string;
}


export const AdsFiltersPanel = ({
  filters,
  setFilters,
  placeholder,
}: AdsFiltersPanelProps) => {
  const { control, watch } = useForm<FormValues>({
    defaultValues: { search: filters.search },
  });

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
            placeholder={placeholder}
            field={field}
          />
        )}
      />
    </form>
  );
};
