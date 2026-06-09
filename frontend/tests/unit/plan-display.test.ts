import { describe, it, expect } from "vitest";
import { formatDataGb } from "../../lib/format-plan";

describe("formatDataGb", () => {
  it('returns "Unlimited" for 999', () => {
    expect(formatDataGb(999)).toBe("Unlimited");
  });

  it('returns "10 GB" for 10', () => {
    expect(formatDataGb(10)).toBe("10 GB");
  });

  it('returns "1 GB" for 1', () => {
    expect(formatDataGb(1)).toBe("1 GB");
  });
});
