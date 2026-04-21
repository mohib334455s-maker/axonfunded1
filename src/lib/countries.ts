import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en as import("i18n-iso-countries").LocaleData);

/** ISO 3166-1 official English short names (all registered codes), A–Z. */
const sortedUnique = (() => {
  const map = countries.getNames("en", { select: "official" });
  return Array.from(new Set(Object.values(map)))
    .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, "en"));
})();

export const WORLD_COUNTRY_NAMES_EN: readonly string[] = sortedUnique;
