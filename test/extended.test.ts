import { describe, expect, it } from "vitest";
import {
    isNumberBetween,
    isNonEmptyArray,
    isNonEmptyArrayOf,
    isString,
    isNumber,
    isPartialOf,
    isRefined,
    isObjectOf,
    isBoolean,
} from "~/inspect";

describe("Extended Type Inspectors", () => {
    describe("isNumberInRange", () => {
        const isValidAge = isNumberBetween(0, 120);

        it("should return true for numbers within range", () => {
            expect(isValidAge(0)).toBe(true);
            expect(isValidAge(50)).toBe(true);
            expect(isValidAge(120)).toBe(true);
        });

        it("should return false for numbers outside range", () => {
            expect(isValidAge(-1)).toBe(false);
            expect(isValidAge(121)).toBe(false);
        });

        it("should return false for non-numbers", () => {
            expect(isValidAge("50")).toBe(false);
            expect(isValidAge(null)).toBe(false);
            expect(isValidAge(undefined)).toBe(false);
            expect(isValidAge({})).toBe(false);
        });
    });

    describe("isNonEmptyArray", () => {
        it("should return true for non-empty arrays", () => {
            expect(isNonEmptyArray([1])).toBe(true);
            expect(isNonEmptyArray([1, 2, 3])).toBe(true);
            expect(isNonEmptyArray(["a"])).toBe(true);
        });

        it("should return false for empty arrays", () => {
            expect(isNonEmptyArray([])).toBe(false);
        });

        it("should return false for non-arrays", () => {
            expect(isNonEmptyArray(null)).toBe(false);
            expect(isNonEmptyArray(undefined)).toBe(false);
            expect(isNonEmptyArray({})).toBe(false);
            expect(isNonEmptyArray("not an array")).toBe(false);
        });
    });

    describe("isNonEmptyArrayOf", () => {
        const isNonEmptyStringArray = isNonEmptyArrayOf(isString);
        const isNonEmptyNumberArray = isNonEmptyArrayOf(isNumber);

        it("should return true for non-empty arrays of the specified type", () => {
            expect(isNonEmptyStringArray(["a"])).toBe(true);
            expect(isNonEmptyStringArray(["a", "b", "c"])).toBe(true);
            expect(isNonEmptyNumberArray([1])).toBe(true);
            expect(isNonEmptyNumberArray([1, 2, 3])).toBe(true);
        });

        it("should return false for empty arrays", () => {
            expect(isNonEmptyStringArray([])).toBe(false);
            expect(isNonEmptyNumberArray([])).toBe(false);
        });

        it("should return false for arrays with wrong types", () => {
            expect(isNonEmptyStringArray([1])).toBe(false);
            expect(isNonEmptyStringArray([1, 2, 3])).toBe(false);
            expect(isNonEmptyNumberArray(["a"])).toBe(false);
            expect(isNonEmptyNumberArray(["a", "b", "c"])).toBe(false);
        });

        it("should return false for arrays with mixed types", () => {
            expect(isNonEmptyStringArray(["a", 1])).toBe(false);
            expect(isNonEmptyNumberArray([1, "a"])).toBe(false);
        });

        it("should return false for non-arrays", () => {
            expect(isNonEmptyStringArray(null)).toBe(false);
            expect(isNonEmptyStringArray(undefined)).toBe(false);
            expect(isNonEmptyStringArray({})).toBe(false);
            expect(isNonEmptyStringArray("not an array")).toBe(false);
        });
    });

    describe("isPartialOf", () => {
        // Define a type for the test
        type Person = {
            name: string;
            age: number;
            email: string;
        };

        const personShape = {
            name: isString,
            age: isNumber,
            email: isString,
        };

        const isPartialPerson = isPartialOf<Person>(personShape);

        it("should return true for objects with all required properties", () => {
            expect(
                isPartialPerson({
                    name: "John",
                    age: 30,
                    email: "john@example.com",
                })
            ).toBe(true);
        });

        it("should return true for objects with additional properties", () => {
            expect(
                isPartialPerson({
                    name: "John",
                    age: 30,
                    email: "john@example.com",
                    address: "123 Main St",
                    isAdmin: true,
                })
            ).toBe(true);
        });

        it("should return true for objects with a subset of properties", () => {
            // Just name
            expect(
                isPartialPerson({
                    name: "John",
                })
            ).toBe(true);

            // Just age
            expect(
                isPartialPerson({
                    age: 30,
                })
            ).toBe(true);

            // Just name and age
            expect(
                isPartialPerson({
                    name: "John",
                    age: 30,
                })
            ).toBe(true);
        });

        it("should return true for empty objects", () => {
            expect(isPartialPerson({})).toBe(true);
        });

        it("should return false for objects with properties of wrong type", () => {
            expect(
                isPartialPerson({
                    name: "John",
                    age: "30", // Should be number
                })
            ).toBe(false);

            expect(
                isPartialPerson({
                    email: 123, // Should be string
                })
            ).toBe(false);
        });

        it("should return false for non-objects", () => {
            expect(isPartialPerson(null)).toBe(false);
            expect(isPartialPerson(undefined)).toBe(false);
            expect(isPartialPerson("not an object")).toBe(false);
            expect(isPartialPerson(123)).toBe(false);
        });
    });

    describe("isRefined", () => {
        // Is positive number
        const isPositiveNumber = isRefined(isNumber, (n) => n > 0);

        // Is even number
        const isEvenNumber = isRefined(isNumber, (n) => n % 2 === 0);

        // Multiple predicates: positive and even
        const isPositiveEvenNumber = isRefined(
            isNumber,
            (n) => n > 0,
            (n) => n % 2 === 0
        );

        // Adult (age >= 18) who can also vote (age >= 18 && citizen)
        type Person = { age: number; citizen: boolean };
        const isAdult = isRefined(isObjectOf<Person>({ age: isNumber, citizen: isBoolean }), (p) => p.age >= 18);
        const isVoter = isRefined(
            isObjectOf<Person>({ age: isNumber, citizen: isBoolean }),
            (p) => p.age >= 18,
            (p) => p.citizen === true
        );

        it("should return true for values matching base type and a single predicate", () => {
            expect(isPositiveNumber(5)).toBe(true);
            expect(isEvenNumber(4)).toBe(true);
            expect(isAdult({ age: 21, citizen: true })).toBe(true);
            expect(isAdult({ age: 21, citizen: false })).toBe(true);
        });

        it("should return true for values matching base type and multiple predicates", () => {
            expect(isPositiveEvenNumber(2)).toBe(true);
            expect(isPositiveEvenNumber(4)).toBe(true);
            expect(isVoter({ age: 21, citizen: true })).toBe(true);
        });

        it("should return false when any predicate fails", () => {
            // Positive but not even
            expect(isPositiveEvenNumber(3)).toBe(false);
            // Even but not positive
            expect(isPositiveEvenNumber(-2)).toBe(false);
            // Neither positive nor even
            expect(isPositiveEvenNumber(-3)).toBe(false);

            // Adult but not a citizen
            expect(isVoter({ age: 21, citizen: false })).toBe(false);
            // Citizen but not an adult
            expect(isVoter({ age: 16, citizen: true })).toBe(false);
            // Neither adult nor citizen
            expect(isVoter({ age: 16, citizen: false })).toBe(false);
        });

        it("should return false for values matching base type but failing predicate", () => {
            expect(isPositiveNumber(-5)).toBe(false);
            expect(isPositiveNumber(0)).toBe(false);
            expect(isEvenNumber(3)).toBe(false);
            expect(isAdult({ age: 16, citizen: true })).toBe(false);
        });

        it("should return false for values not matching base type", () => {
            expect(isPositiveNumber("5")).toBe(false);
            expect(isEvenNumber("4")).toBe(false);
            expect(isPositiveEvenNumber("2")).toBe(false);
            expect(isAdult("21")).toBe(false);
            expect(isVoter("voter")).toBe(false);
            expect(isPositiveNumber(null)).toBe(false);
            expect(isPositiveNumber(undefined)).toBe(false);
            expect(isAdult({ age: "21", citizen: true })).toBe(false);
            expect(isVoter({ age: 21 })).toBe(false);
        });
    });
});
