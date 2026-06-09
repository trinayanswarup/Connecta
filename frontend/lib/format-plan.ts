export function formatDataGb(dataGb: number): string {
  if (dataGb >= 999) return "Unlimited";
  return `${dataGb} GB`;
}
