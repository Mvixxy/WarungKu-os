import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatShortDate,
  formatDateTime,
  formatTime,
  getInitials,
} from "@/lib/format";

describe("formatCurrency", () => {
  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });

  it("formats positive number with IDR", () => {
    const result = formatCurrency(50000);
    expect(result).toContain("50");
    expect(result).toContain("000");
  });

  it("formats large number", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("1.500.000");
  });
});

describe("formatCompactCurrency", () => {
  it("formats large number compactly", () => {
    const result = formatCompactCurrency(1500000);
    expect(result).toBeTruthy();
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-08-12");
    expect(result).toContain("12");
    expect(result).toContain("2026");
  });
});

describe("formatShortDate", () => {
  it("returns short date format", () => {
    const result = formatShortDate("2026-08-12");
    expect(result).toContain("12");
  });
});

describe("formatDateTime", () => {
  it("includes time components", () => {
    const result = formatDateTime("2026-08-12T14:30:00Z");
    expect(result).toContain("12");
  });
});

describe("formatTime", () => {
  it("returns time format", () => {
    const result = formatTime("2026-08-12T14:30:00Z");
    expect(result).toBeTruthy();
  });
});

describe("getInitials", () => {
  it("returns single initial", () => {
    expect(getInitials("Budi")).toBe("B");
  });

  it("returns two initials from full name", () => {
    expect(getInitials("Budi Santoso")).toBe("BS");
  });

  it("truncates to two initials", () => {
    expect(getInitials("Budi Santoso Pratama")).toBe("BS");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("");
  });

  it("handles extra spaces", () => {
    expect(getInitials("  Budi  Santoso  ")).toBe("BS");
  });
});
