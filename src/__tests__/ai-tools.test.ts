import { describe, it, expect } from "vitest";

// Test the pure utility functions from AI tools
// We can't test DB-dependent functions without mocking, but we can test logic

describe("periodRange logic", () => {
  // Replicate the periodRange function
  function periodRange(period: "today" | "week" | "month") {
    const now = new Date();
    const start = new Date(now);
    if (period === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }
    return { start: start.toISOString(), end: now.toISOString() };
  }

  it("today starts at midnight", () => {
    const { start } = periodRange("today");
    const d = new Date(start);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("week goes back 6 days", () => {
    const { start } = periodRange("week");
    const d = new Date(start);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(6);
  });

  it("month goes back 29 days", () => {
    const { start } = periodRange("month");
    const d = new Date(start);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(29);
  });
});

describe("rupiah formatting", () => {
  function rupiah(value: number) {
    return `Rp${Math.round(value).toLocaleString("id-ID")}`;
  }

  it("formats basic amount", () => {
    expect(rupiah(50000)).toBe("Rp50.000");
  });

  it("formats millions", () => {
    expect(rupiah(1500000)).toBe("Rp1.500.000");
  });

  it("rounds decimal values", () => {
    expect(rupiah(50000.7)).toBe("Rp50.001");
  });
});
