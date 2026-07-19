import { describe, expect, test } from "vitest";
import { finiteNumber, requiredText, uniqueTextArray } from "./securityValidation";
import { assertAccessTransition } from "./matches";

describe("semantic server validation", () => {
  test("rejects non-finite and out-of-range numbers", () => {
    expect(() => finiteNumber(Number.NaN, "Amount", 0, 100)).toThrow();
    expect(() => finiteNumber(Number.POSITIVE_INFINITY, "Amount", 0, 100)).toThrow();
    expect(() => finiteNumber(-1, "Amount", 0, 100)).toThrow();
  });

  test("rejects oversized or control-character text", () => {
    expect(() => requiredText("x".repeat(11), "Text", 10)).toThrow();
    expect(() => requiredText("unsafe\u0000value", "Text", 100)).toThrow();
  });

  test("rejects duplicate, excessive, and unknown array values", () => {
    expect(() => uniqueTextArray(["a", "a"], "Values", ["a", "b"])).toThrow();
    expect(() => uniqueTextArray(["unknown"], "Values", ["a", "b"])).toThrow();
    expect(() => uniqueTextArray(Array.from({ length: 13 }, (_, i) => String(i)), "Values", [])).toThrow();
  });

  test("rejects skipped or backward disclosure transitions except emergency hiding", () => {
    expect(() => assertAccessTransition("hidden", "introduced")).toThrow();
    expect(() => assertAccessTransition("teaser_shared", "intro_approved")).toThrow();
    expect(() => assertAccessTransition("introduced", "hidden")).not.toThrow();
  });
});
