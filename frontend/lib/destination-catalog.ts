export type DestinationKind = "country" | "regional" | "global";

export type DestinationOption = {
  name: string;
  region: string;
  kind: DestinationKind;
};

export type MarketingPlan = {
  data: string;
  days: string;
  price: string;
  bestChoice?: boolean;
  validityOptions?: Array<{
    days: string;
    dayCount: number;
    price: string;
  }>;
};

type MarketingPlanTemplate = {
  data: string;
  days: string;
  priceUsd: number;
  bestChoice?: boolean;
  validityOptions?: Array<{
    days: string;
    dayCount: number;
    priceUsd: number;
  }>;
};

export const regionalDestinations: DestinationOption[] = [
  { name: "Global", region: "Worldwide coverage", kind: "global" },
  { name: "Africa", region: "Regional plan", kind: "regional" },
  { name: "Asia", region: "Regional plan", kind: "regional" },
  { name: "Europe", region: "Regional plan", kind: "regional" },
  { name: "North America", region: "Regional plan", kind: "regional" },
  { name: "South America", region: "Regional plan", kind: "regional" },
  { name: "Oceania", region: "Regional plan", kind: "regional" },
  { name: "Middle East", region: "Regional plan", kind: "regional" },
  { name: "Caribbean", region: "Regional plan", kind: "regional" }
];

export const countryDestinations: DestinationOption[] = [
  { name: "Afghanistan", region: "Asia", kind: "country" },
  { name: "Albania", region: "Europe", kind: "country" },
  { name: "Algeria", region: "Africa", kind: "country" },
  { name: "Andorra", region: "Europe", kind: "country" },
  { name: "Angola", region: "Africa", kind: "country" },
  { name: "Antigua and Barbuda", region: "Caribbean", kind: "country" },
  { name: "Argentina", region: "South America", kind: "country" },
  { name: "Armenia", region: "Asia", kind: "country" },
  { name: "Australia", region: "Oceania", kind: "country" },
  { name: "Austria", region: "Europe", kind: "country" },
  { name: "Azerbaijan", region: "Asia", kind: "country" },
  { name: "Bahamas", region: "Caribbean", kind: "country" },
  { name: "Bahrain", region: "Middle East", kind: "country" },
  { name: "Bangladesh", region: "Asia", kind: "country" },
  { name: "Barbados", region: "Caribbean", kind: "country" },
  { name: "Belarus", region: "Europe", kind: "country" },
  { name: "Belgium", region: "Europe", kind: "country" },
  { name: "Belize", region: "North America", kind: "country" },
  { name: "Benin", region: "Africa", kind: "country" },
  { name: "Bhutan", region: "Asia", kind: "country" },
  { name: "Bolivia", region: "South America", kind: "country" },
  { name: "Bosnia and Herzegovina", region: "Europe", kind: "country" },
  { name: "Botswana", region: "Africa", kind: "country" },
  { name: "Brazil", region: "South America", kind: "country" },
  { name: "Brunei", region: "Asia", kind: "country" },
  { name: "Bulgaria", region: "Europe", kind: "country" },
  { name: "Burkina Faso", region: "Africa", kind: "country" },
  { name: "Burundi", region: "Africa", kind: "country" },
  { name: "Cambodia", region: "Asia", kind: "country" },
  { name: "Cameroon", region: "Africa", kind: "country" },
  { name: "Canada", region: "North America", kind: "country" },
  { name: "Cape Verde", region: "Africa", kind: "country" },
  { name: "Central African Republic", region: "Africa", kind: "country" },
  { name: "Chad", region: "Africa", kind: "country" },
  { name: "Chile", region: "South America", kind: "country" },
  { name: "China", region: "Asia", kind: "country" },
  { name: "Colombia", region: "South America", kind: "country" },
  { name: "Comoros", region: "Africa", kind: "country" },
  { name: "Congo", region: "Africa", kind: "country" },
  { name: "Costa Rica", region: "North America", kind: "country" },
  { name: "Cote d'Ivoire", region: "Africa", kind: "country" },
  { name: "Croatia", region: "Europe", kind: "country" },
  { name: "Cuba", region: "Caribbean", kind: "country" },
  { name: "Cyprus", region: "Europe", kind: "country" },
  { name: "Czech Republic", region: "Europe", kind: "country" },
  { name: "Democratic Republic of the Congo", region: "Africa", kind: "country" },
  { name: "Denmark", region: "Europe", kind: "country" },
  { name: "Djibouti", region: "Africa", kind: "country" },
  { name: "Dominica", region: "Caribbean", kind: "country" },
  { name: "Dominican Republic", region: "Caribbean", kind: "country" },
  { name: "Ecuador", region: "South America", kind: "country" },
  { name: "Egypt", region: "Africa", kind: "country" },
  { name: "El Salvador", region: "North America", kind: "country" },
  { name: "Equatorial Guinea", region: "Africa", kind: "country" },
  { name: "Eritrea", region: "Africa", kind: "country" },
  { name: "Estonia", region: "Europe", kind: "country" },
  { name: "Eswatini", region: "Africa", kind: "country" },
  { name: "Ethiopia", region: "Africa", kind: "country" },
  { name: "Fiji", region: "Oceania", kind: "country" },
  { name: "Finland", region: "Europe", kind: "country" },
  { name: "France", region: "Europe", kind: "country" },
  { name: "Gabon", region: "Africa", kind: "country" },
  { name: "Gambia", region: "Africa", kind: "country" },
  { name: "Georgia", region: "Asia", kind: "country" },
  { name: "Germany", region: "Europe", kind: "country" },
  { name: "Ghana", region: "Africa", kind: "country" },
  { name: "Greece", region: "Europe", kind: "country" },
  { name: "Grenada", region: "Caribbean", kind: "country" },
  { name: "Guatemala", region: "North America", kind: "country" },
  { name: "Guinea", region: "Africa", kind: "country" },
  { name: "Guinea-Bissau", region: "Africa", kind: "country" },
  { name: "Guyana", region: "South America", kind: "country" },
  { name: "Haiti", region: "Caribbean", kind: "country" },
  { name: "Honduras", region: "North America", kind: "country" },
  { name: "Hong Kong", region: "Asia", kind: "country" },
  { name: "Hungary", region: "Europe", kind: "country" },
  { name: "Iceland", region: "Europe", kind: "country" },
  { name: "India", region: "Asia", kind: "country" },
  { name: "Indonesia", region: "Asia", kind: "country" },
  { name: "Iran", region: "Middle East", kind: "country" },
  { name: "Iraq", region: "Middle East", kind: "country" },
  { name: "Ireland", region: "Europe", kind: "country" },
  { name: "Israel", region: "Middle East", kind: "country" },
  { name: "Italy", region: "Europe", kind: "country" },
  { name: "Jamaica", region: "Caribbean", kind: "country" },
  { name: "Japan", region: "Asia", kind: "country" },
  { name: "Jordan", region: "Middle East", kind: "country" },
  { name: "Kazakhstan", region: "Asia", kind: "country" },
  { name: "Kenya", region: "Africa", kind: "country" },
  { name: "Kiribati", region: "Oceania", kind: "country" },
  { name: "Kosovo", region: "Europe", kind: "country" },
  { name: "Kuwait", region: "Middle East", kind: "country" },
  { name: "Kyrgyzstan", region: "Asia", kind: "country" },
  { name: "Laos", region: "Asia", kind: "country" },
  { name: "Latvia", region: "Europe", kind: "country" },
  { name: "Lebanon", region: "Middle East", kind: "country" },
  { name: "Lesotho", region: "Africa", kind: "country" },
  { name: "Liberia", region: "Africa", kind: "country" },
  { name: "Libya", region: "Africa", kind: "country" },
  { name: "Liechtenstein", region: "Europe", kind: "country" },
  { name: "Lithuania", region: "Europe", kind: "country" },
  { name: "Luxembourg", region: "Europe", kind: "country" },
  { name: "Macau", region: "Asia", kind: "country" },
  { name: "Madagascar", region: "Africa", kind: "country" },
  { name: "Malawi", region: "Africa", kind: "country" },
  { name: "Malaysia", region: "Asia", kind: "country" },
  { name: "Maldives", region: "Asia", kind: "country" },
  { name: "Mali", region: "Africa", kind: "country" },
  { name: "Malta", region: "Europe", kind: "country" },
  { name: "Marshall Islands", region: "Oceania", kind: "country" },
  { name: "Mauritania", region: "Africa", kind: "country" },
  { name: "Mauritius", region: "Africa", kind: "country" },
  { name: "Mexico", region: "North America", kind: "country" },
  { name: "Micronesia", region: "Oceania", kind: "country" },
  { name: "Moldova", region: "Europe", kind: "country" },
  { name: "Monaco", region: "Europe", kind: "country" },
  { name: "Mongolia", region: "Asia", kind: "country" },
  { name: "Montenegro", region: "Europe", kind: "country" },
  { name: "Morocco", region: "Africa", kind: "country" },
  { name: "Mozambique", region: "Africa", kind: "country" },
  { name: "Myanmar", region: "Asia", kind: "country" },
  { name: "Namibia", region: "Africa", kind: "country" },
  { name: "Nauru", region: "Oceania", kind: "country" },
  { name: "Nepal", region: "Asia", kind: "country" },
  { name: "Netherlands", region: "Europe", kind: "country" },
  { name: "New Zealand", region: "Oceania", kind: "country" },
  { name: "Nicaragua", region: "North America", kind: "country" },
  { name: "Niger", region: "Africa", kind: "country" },
  { name: "Nigeria", region: "Africa", kind: "country" },
  { name: "North Korea", region: "Asia", kind: "country" },
  { name: "North Macedonia", region: "Europe", kind: "country" },
  { name: "Norway", region: "Europe", kind: "country" },
  { name: "Oman", region: "Middle East", kind: "country" },
  { name: "Pakistan", region: "Asia", kind: "country" },
  { name: "Palau", region: "Oceania", kind: "country" },
  { name: "Palestine", region: "Middle East", kind: "country" },
  { name: "Panama", region: "North America", kind: "country" },
  { name: "Papua New Guinea", region: "Oceania", kind: "country" },
  { name: "Paraguay", region: "South America", kind: "country" },
  { name: "Peru", region: "South America", kind: "country" },
  { name: "Philippines", region: "Asia", kind: "country" },
  { name: "Poland", region: "Europe", kind: "country" },
  { name: "Portugal", region: "Europe", kind: "country" },
  { name: "Puerto Rico", region: "Caribbean", kind: "country" },
  { name: "Qatar", region: "Middle East", kind: "country" },
  { name: "Romania", region: "Europe", kind: "country" },
  { name: "Russia", region: "Europe", kind: "country" },
  { name: "Rwanda", region: "Africa", kind: "country" },
  { name: "Saint Kitts and Nevis", region: "Caribbean", kind: "country" },
  { name: "Saint Lucia", region: "Caribbean", kind: "country" },
  { name: "Saint Vincent and the Grenadines", region: "Caribbean", kind: "country" },
  { name: "Samoa", region: "Oceania", kind: "country" },
  { name: "San Marino", region: "Europe", kind: "country" },
  { name: "Sao Tome and Principe", region: "Africa", kind: "country" },
  { name: "Saudi Arabia", region: "Middle East", kind: "country" },
  { name: "Senegal", region: "Africa", kind: "country" },
  { name: "Serbia", region: "Europe", kind: "country" },
  { name: "Seychelles", region: "Africa", kind: "country" },
  { name: "Sierra Leone", region: "Africa", kind: "country" },
  { name: "Singapore", region: "Asia", kind: "country" },
  { name: "Slovakia", region: "Europe", kind: "country" },
  { name: "Slovenia", region: "Europe", kind: "country" },
  { name: "Solomon Islands", region: "Oceania", kind: "country" },
  { name: "Somalia", region: "Africa", kind: "country" },
  { name: "South Africa", region: "Africa", kind: "country" },
  { name: "South Korea", region: "Asia", kind: "country" },
  { name: "South Sudan", region: "Africa", kind: "country" },
  { name: "Spain", region: "Europe", kind: "country" },
  { name: "Sri Lanka", region: "Asia", kind: "country" },
  { name: "Sudan", region: "Africa", kind: "country" },
  { name: "Suriname", region: "South America", kind: "country" },
  { name: "Sweden", region: "Europe", kind: "country" },
  { name: "Switzerland", region: "Europe", kind: "country" },
  { name: "Syria", region: "Middle East", kind: "country" },
  { name: "Taiwan", region: "Asia", kind: "country" },
  { name: "Tajikistan", region: "Asia", kind: "country" },
  { name: "Tanzania", region: "Africa", kind: "country" },
  { name: "Thailand", region: "Asia", kind: "country" },
  { name: "Timor-Leste", region: "Asia", kind: "country" },
  { name: "Togo", region: "Africa", kind: "country" },
  { name: "Tonga", region: "Oceania", kind: "country" },
  { name: "Trinidad and Tobago", region: "Caribbean", kind: "country" },
  { name: "Tunisia", region: "Africa", kind: "country" },
  { name: "Turkey", region: "Middle East", kind: "country" },
  { name: "Turkmenistan", region: "Asia", kind: "country" },
  { name: "Tuvalu", region: "Oceania", kind: "country" },
  { name: "Uganda", region: "Africa", kind: "country" },
  { name: "Ukraine", region: "Europe", kind: "country" },
  { name: "United Arab Emirates", region: "Middle East", kind: "country" },
  { name: "United Kingdom", region: "Europe", kind: "country" },
  { name: "United States", region: "North America", kind: "country" },
  { name: "Uruguay", region: "South America", kind: "country" },
  { name: "Uzbekistan", region: "Asia", kind: "country" },
  { name: "Vanuatu", region: "Oceania", kind: "country" },
  { name: "Vatican City", region: "Europe", kind: "country" },
  { name: "Venezuela", region: "South America", kind: "country" },
  { name: "Vietnam", region: "Asia", kind: "country" },
  { name: "Yemen", region: "Middle East", kind: "country" },
  { name: "Zambia", region: "Africa", kind: "country" },
  { name: "Zimbabwe", region: "Africa", kind: "country" }
];

export const destinationOptions = [...regionalDestinations, ...countryDestinations];

export function slugifyDestination(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function destinationHref(destination: string, params: Record<string, string | undefined> = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  if (destination) {
    searchParams.set("destination", destination);
  }

  const plannerQuery = searchParams.toString();
  return `/trip/new${plannerQuery ? `?${plannerQuery}` : ""}`;
}

export function findDestinationBySlug(slug: string) {
  return destinationOptions.find((destination) => slugifyDestination(destination.name) === slug);
}

const standardPlanTemplates: MarketingPlanTemplate[] = [
  { data: "1 GB", days: "7 days", priceUsd: 3.99 },
  { data: "3 GB", days: "30 days", priceUsd: 6.99 },
  { data: "5 GB", days: "30 days", priceUsd: 9.99 },
  { data: "10 GB", days: "30 days", priceUsd: 15.99 },
  { data: "20 GB", days: "30 days", priceUsd: 22.99, bestChoice: true },
  {
    data: "Unlimited GB",
    days: "30 days",
    priceUsd: 71.99,
    validityOptions: [
      { dayCount: 10, days: "10 days", priceUsd: 34.99 },
      { dayCount: 15, days: "15 days", priceUsd: 48.99 },
      { dayCount: 20, days: "20 days", priceUsd: 59.99 },
      { dayCount: 25, days: "25 days", priceUsd: 65.99 },
      { dayCount: 30, days: "30 days", priceUsd: 71.99 }
    ]
  }
];

export const marketingPlans: MarketingPlan[] = toMarketingPlans(standardPlanTemplates);

export function plansForDestination(_destination: string) {
  return toMarketingPlans(standardPlanTemplates);
}

function toMarketingPlans(templates: MarketingPlanTemplate[]): MarketingPlan[] {
  return templates.map((template) => ({
    data: template.data,
    days: template.days,
    price: formatUsd(template.priceUsd),
    bestChoice: template.bestChoice,
    validityOptions: template.validityOptions?.map((option) => ({
      dayCount: option.dayCount,
      days: option.days,
      price: formatUsd(option.priceUsd)
    }))
  }));
}

function formatUsd(value: number) {
  return `US$${value.toFixed(2)}`;
}
