import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Country, State, City } from "country-state-city";
import { useTranslation } from "react-i18next";
import countriesLib from "../../locales/countries";

export interface CountryOption {
  isoCode: string;
  name: string;
}

export interface StateOption {
  isoCode: string;
  name: string;
  countryCode: string;
}

export interface CityOption {
  name: string;
  countryCode: string;
  stateCode?: string;
}

export const useCountries = (): UseQueryResult<CountryOption[]> => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("es") ? "es" : "en";

  return useQuery<CountryOption[]>({
    queryKey: ["countries", lang],
    queryFn: () => {
      const raw = Country.getAllCountries();
      return raw.map((c) => ({
        isoCode: c.isoCode,
        name: countriesLib.getName(c.isoCode, lang) || c.name,
      }));
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useStates = (countryCode: string): UseQueryResult<StateOption[]> =>
  useQuery<StateOption[]>({
    queryKey: ["states", countryCode],
    enabled: !!countryCode,
    queryFn: () => State.getStatesOfCountry(countryCode) as StateOption[],
  });

export const useCities = (countryCode: string, stateCode?: string): UseQueryResult<CityOption[]> =>
  useQuery<CityOption[]>({
    queryKey: ["cities", countryCode, stateCode],
    enabled: !!countryCode,
    queryFn: () =>
      stateCode
        ? (City.getCitiesOfState(countryCode, stateCode) as CityOption[])
        : (City.getCitiesOfCountry(countryCode) as CityOption[]),
  });
