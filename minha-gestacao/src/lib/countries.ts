// Países suportados no perfil, usando o padrão ISO 3166-1 alpha-2
// (country_code), para casar com a tabela product_recommendations.
export interface CountryOption {
  code: string;
  label: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "BR", label: "Brasil" },
  { code: "PT", label: "Portugal" },
  { code: "US", label: "Estados Unidos" },
  { code: "ES", label: "Espanha" },
  { code: "OT", label: "Outro" },
];

export function countryLabel(code: string | null): string {
  if (!code) return "Não informado";
  return COUNTRY_OPTIONS.find((c) => c.code === code)?.label ?? code;
}
