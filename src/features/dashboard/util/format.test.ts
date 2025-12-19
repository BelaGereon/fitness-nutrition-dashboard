import { describe, expect, it } from "vitest";
import { formatData } from "./format";

describe("formatData", () => {
  it("returns 'n/a' for undefined", () => {
    expect(formatData(undefined, { decimals: 1, unit: "kg" })).toBe("n/a");
  });

  it("returns 'n/a' for NaN", () => {
    expect(formatData(Number.NaN, { decimals: 1, unit: "kg" })).toBe("n/a");
  });

  it("formats numbers with specified decimals and unit", () => {
    expect(formatData(75.6789, { decimals: 2, unit: "kg" })).toBe("75.68 kg");
  });

  it("formats numbers without unit when unit is not provided", () => {
    expect(formatData(42.1234, { decimals: 1 })).toBe("42.1");
  });

  it("includes a space before unit by default", () => {
    expect(formatData(100, { decimals: 0, unit: "kcal" })).toBe("100 kcal");
  });

  it("omits space before unit when space option is false", () => {
    expect(formatData(100, { decimals: 0, unit: "kcal", space: false })).toBe(
      "100kcal"
    );
  });

  it("formats numbers with decimals=0 by rounding", () => {
    expect(formatData(2750.6, { decimals: 0, unit: "kcal" })).toBe("2751 kcal");
  });
});
