export function trackEvent(name: string, properties: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", name, properties);
  }
}
