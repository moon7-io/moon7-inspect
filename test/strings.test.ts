import { describe, expect, it } from "vitest";
import { isStringMatching, isISODateString, isEmail } from "~/strings";

describe("String Inspectors", () => {
    describe("isStringMatching", () => {
        const isZipCode = isStringMatching(/^\d{5}(-\d{4})?$/);

        it("should return true for strings matching pattern", () => {
            expect(isZipCode("12345")).toBe(true);
            expect(isZipCode("12345-6789")).toBe(true);
        });

        it("should return false for strings not matching pattern", () => {
            expect(isZipCode("1234")).toBe(false);
            expect(isZipCode("123456")).toBe(false);
            expect(isZipCode("12345-")).toBe(false);
            expect(isZipCode("12345-67890")).toBe(false);
        });

        it("should return false for non-strings", () => {
            expect(isZipCode(12345)).toBe(false);
            expect(isZipCode(null)).toBe(false);
            expect(isZipCode(undefined)).toBe(false);
            expect(isZipCode({})).toBe(false);
        });
    });

    describe("isISODateString", () => {
        it("should return true for valid ISO date strings", () => {
            expect(isISODateString("2023-01-01")).toBe(true);
            expect(isISODateString("2023-01-01T12:00:00Z")).toBe(true);
            expect(isISODateString("2023-01-01T12:00:00.000Z")).toBe(true);
            expect(isISODateString("2023-01-01T12:00:00+01:00")).toBe(true);
        });

        it("should return false for invalid ISO date strings", () => {
            expect(isISODateString("2023/01/01")).toBe(false);
            expect(isISODateString("01-01-2023")).toBe(false);
            expect(isISODateString("Jan 1, 2023")).toBe(false);
            expect(isISODateString("not a date")).toBe(false);
            expect(isISODateString("2023-13-01")).toBe(false); // Invalid month
        });

        it("should return false for non-strings", () => {
            expect(isISODateString(new Date())).toBe(false);
            expect(isISODateString(123)).toBe(false);
            expect(isISODateString(null)).toBe(false);
            expect(isISODateString(undefined)).toBe(false);
        });
    });

    describe("isEmail", () => {
        it("should return true for valid email addresses", () => {
            expect(isEmail("user@example.com")).toBe(true);
            expect(isEmail("user.name@example.com")).toBe(true);
            expect(isEmail("user+tag@example.com")).toBe(true);
            expect(isEmail("user@subdomain.example.com")).toBe(true);
        });

        it("should return false for invalid email addresses", () => {
            expect(isEmail("user@")).toBe(false);
            expect(isEmail("@example.com")).toBe(false);
            expect(isEmail("user@.com")).toBe(false);
            expect(isEmail("user@example")).toBe(false);
            expect(isEmail("user example.com")).toBe(false);
            expect(isEmail("user@exam ple.com")).toBe(false);
        });

        it("should return false for non-strings", () => {
            expect(isEmail(123)).toBe(false);
            expect(isEmail(null)).toBe(false);
            expect(isEmail(undefined)).toBe(false);
            expect(isEmail({})).toBe(false);
        });
    });
});
