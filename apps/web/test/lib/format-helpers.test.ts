import { describe, expect, it } from "vitest";
import { isNegativeAmount, isPositiveAmount, parseAmountSafe, formatCurrency } from "@/app/lib/format";

describe("string-first amount helpers", () => {
  it("detects negative amounts without float conversion", () => {
    expect(isNegativeAmount("-219.00")).toBe(true);
    expect(isNegativeAmount("  -0.01")).toBe(true);
    expect(isNegativeAmount("(219.00)")).toBe(true);
    expect(isNegativeAmount("219.00")).toBe(false);
    expect(isNegativeAmount("0.00")).toBe(false);
    expect(isNegativeAmount(null)).toBe(false);
    expect(isNegativeAmount(-5)).toBe(true);
  });

  it("detects positive amounts without treating zero as positive", () => {
    expect(isPositiveAmount("100.00")).toBe(true);
    expect(isPositiveAmount("0.01")).toBe(true);
    expect(isPositiveAmount("0.00")).toBe(false);
    expect(isPositiveAmount("0")).toBe(false);
    expect(isPositiveAmount("")).toBe(false);
    expect(isPositiveAmount(null)).toBe(false);
    expect(isPositiveAmount("-5.00")).toBe(false);
    expect(isPositiveAmount("(5.00)")).toBe(false);
  });

  it("parses safely for layout math only", () => {
    expect(parseAmountSafe("123.45")).toBeCloseTo(123.45);
    expect(parseAmountSafe("")).toBe(0);
    expect(parseAmountSafe(null)).toBe(0);
    expect(parseAmountSafe("not-a-number")).toBe(0);
    expect(parseAmountSafe(undefined)).toBe(0);
  });

  it("preserves negative sign in display formatting", () => {
    expect(formatCurrency("-219.00")).toContain("-");
    expect(formatCurrency("219.00")).not.toContain("-");
  });
});
