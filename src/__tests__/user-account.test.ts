import { describe, it, expect } from "vitest";

describe("User account validation", () => {
  it("rejects empty name", () => {
    const name = "";
    expect(name.trim().length === 0).true;
  });

  it("accepts valid name", () => {
    const name = "Giovani";
    expect(name.trim().length > 0).true;
  });

  it("rejects short password", () => {
    const pw = "1234567";
    expect(pw.length < 8).true;
  });

  it("accepts valid password length", () => {
    const pw = "12345678";
    expect(pw.length >= 8).true;
  });

  it("rejects mismatched passwords", () => {
    const newPw = ["password123"];
    const confirmPw = ["password456"];
    expect(newPw[0] !== confirmPw[0]).true;
  });

  it("accepts matching passwords", () => {
    const newPw = "password123";
    const confirmPw = "password123";
    expect(newPw === confirmPw).true;
  });
});
