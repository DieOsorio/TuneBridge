// hooks/useCountryCity.js
import { useQuery } from "@tanstack/react-query";

const API = "https://api.countrystatecity.in/v1";
const HEADERS = {
  "X-CSCAPI-KEY": import.meta.env.VITE_CSC_API_KEY,
};

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetch(`${API}/countries`, { headers: HEADERS });
      if (!res.ok) throw new Error("Error fetching countries");
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useCities = (countryCode) => {
  return useQuery({
    queryKey: ["cities", countryCode],
    enabled: !!countryCode,
    queryFn: async () => {
      const res = await fetch(`${API}/countries/${countryCode}/cities`, {
        headers: HEADERS,
      });
      if (!res.ok) throw new Error("Error fetching cities");
      return res.json();
    },
  });
};
