import { describe, it, expect } from "vitest";
import { generateAcknowledgment } from "../../lib/chat-utils";

describe("generateAcknowledgment", () => {
  it("contains destination and duration for SOLO", () => {
    const result = generateAcknowledgment("Japan", 10, "SOLO");
    expect(result).toContain("Japan");
    expect(result).toContain("10");
  });

  it("contains destination and work-related words for BUSINESS", () => {
    const result = generateAcknowledgment("Germany", 5, "BUSINESS");
    expect(result).toContain("Germany");
    const hasWorkWord =
      result.includes("calls") || result.includes("hotspot") || result.includes("navigation");
    expect(hasWorkWord).toBe(true);
  });

  it("contains destination for SOLO trip to Thailand", () => {
    const result = generateAcknowledgment("Thailand", 14, "SOLO");
    expect(result).toContain("Thailand");
  });
});
