import { useQuery } from "@tanstack/react-query";
import { Country, State, City } from "country-state-city";
import { useTranslation } from "react-i18next";
import countriesLib from "../../locales/countries";

/* countries (ISO‑2, name, etc.) */
export const useCountries = () => {
  const { i18n } = useTranslation();        // "en" | "es" | …
  const lang     = i18n.language.startsWith("es") ? "es" : "en";

  return useQuery({
    queryKey: ["countries", lang],
    queryFn: () => {
      const raw = Country.getAllCountries();
      return raw.map((c) => ({
        isoCode: c.isoCode,
        name: countriesLib.getName(c.isoCode, lang) || c.name, // fallback to EN
      }));
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

/* states / provinces of a country */
export const useStates = (countryCode) =>
  useQuery({
    queryKey: ["states", countryCode],
    enabled: !!countryCode,
    queryFn: () => State.getStatesOfCountry(countryCode),
  });

/* cities of a state OR fall back to all cities of the country */
export const useCities = (countryCode, stateCode) =>
  useQuery({
    queryKey: ["cities", countryCode, stateCode],
    enabled: !!countryCode,
    queryFn: () =>
      stateCode
        ? City.getCitiesOfState(countryCode, stateCode)
        : City.getCitiesOfCountry(countryCode),
  });
