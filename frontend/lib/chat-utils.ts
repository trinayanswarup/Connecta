export function formatDuration(days: number): string {
  if (days === 1) return "1 day";
  if (days === 7) return "a week";
  if (days === 14) return "two weeks";
  if (days === 21) return "3 weeks";
  return `${days} days`;
}

export function generateAcknowledgment(destination: string, durationDays: number, travelerType: string): string {
  const duration = formatDuration(durationDays);
  switch (travelerType) {
    case "BUSINESS":
      return `${duration} in ${destination} for business. I'll make sure you have enough for calls, hotspot, and navigation.`;
    case "COUPLE":
      return `${destination} for ${duration} — lovely. Finding a plan that covers maps, browsing, and a bit of everything.`;
    case "FAMILY":
      return `${duration} in ${destination} with the family. Getting you covered for maps, messaging, and streaming.`;
    default:
      return `${destination} for ${duration} — great choice. Setting you up with enough for maps, social, and some streaming.`;
  }
}
