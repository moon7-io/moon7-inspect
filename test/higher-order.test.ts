import { describe, it, expect } from "vitest";
import {
    isOptional,
    isNullable,
    isNot,
    isExact,
    isStringOf,
    isNumberOf,
    isBooleanOf,
    isInstanceOf,
    isArrayOf,
    isIterableOf,
    isSetOf,
    isMapOf,
    isRecordOf,
    isAnyOf,
    isAllOf,
    isTupleOf,
    isObjectOf,
    is,
    isString,
    isNumber,
    isBoolean,
    isInt,
    isNever,
    isAny,
    Inspector,
} from "~/inspect";

describe("Higher-Order Inspectors", () => {
    describe("isOptional", () => {
        it("should return true for undefined or the specified type", () => {
            const isOptionalString = isOptional(isString);
            expect(isOptionalString(undefined)).toBe(true);
            expect(isOptionalString("hello")).toBe(true);
        });

        it("should return false for values not matching the type", () => {
            const isOptionalNumber = isOptional(isNumber);
            expect(isOptionalNumber(null)).toBe(false);
            expect(isOptionalNumber("string")).toBe(false);
            expect(isOptionalNumber(true)).toBe(false);
        });
    });

    describe("isNullable", () => {
        it("should return true for null or the specified type", () => {
            const isNullableString = isNullable(isString);
            expect(isNullableString(null)).toBe(true);
            expect(isNullableString("hello")).toBe(true);
        });

        it("should return false for values not matching the type", () => {
            const isNullableNumber = isNullable(isNumber);
            expect(isNullableNumber(undefined)).toBe(false);
            expect(isNullableNumber("string")).toBe(false);
            expect(isNullableNumber(true)).toBe(false);
        });
    });

    describe("isNot", () => {
        it("should negate the result of the given inspector", () => {
            const isNotString = isNot(isString);
            expect(isNotString(0)).toBe(true);
            expect(isNotString(null)).toBe(true);
            expect(isNotString({})).toBe(true);
            expect(isNotString("hello")).toBe(false);
        });
    });

    describe("isExact", () => {
        it("should return true only for the exact value", () => {
            const isFive = isExact(5);
            expect(isFive(5)).toBe(true);
            expect(isFive(4)).toBe(false);
            expect(isFive("5")).toBe(false);
        });

        it("should work with objects by reference", () => {
            const obj = { a: 1 };
            const isObj = isExact(obj);
            expect(isObj(obj)).toBe(true);
            expect(isObj({ a: 1 })).toBe(false); // Different reference
        });
    });

    describe("isStringOf, isNumberOf, isBooleanOf", () => {
        it("should check exact string values", () => {
            const isHello = isStringOf("hello");
            expect(isHello("hello")).toBe(true);
            expect(isHello("world")).toBe(false);
        });

        it("should check exact number values", () => {
            const isFive = isNumberOf(5);
            expect(isFive(5)).toBe(true);
            expect(isFive(10)).toBe(false);
        });

        it("should check exact boolean values", () => {
            const isTrue = isBooleanOf(true);
            expect(isTrue(true)).toBe(true);
            expect(isTrue(false)).toBe(false);
        });
    });

    describe("isInstanceOf", () => {
        it("should check if a value is an instance of a class", () => {
            class TestClass {}
            const isTestClass = isInstanceOf(TestClass);

            expect(isTestClass(new TestClass())).toBe(true);
            expect(isTestClass({})).toBe(false);

            const isDate = isInstanceOf(Date);
            expect(isDate(new Date())).toBe(true);
            expect(isDate("2023-01-01")).toBe(false);
        });
    });

    describe("isArrayOf", () => {
        it("should check if a value is an array of a specific type", () => {
            const isStringArray = isArrayOf(isString);
            expect(isStringArray(["a", "b", "c"])).toBe(true);
            expect(isStringArray([])).toBe(true);
            expect(isStringArray(["a", 1, "c"])).toBe(false);
            expect(isStringArray(null)).toBe(false);
            expect(isStringArray({})).toBe(false);
        });
    });

    describe("isIterableOf", () => {
        it("should check if a value is an iterable of a specific type", () => {
            const isStringIterable = isIterableOf(isString);

            expect(isStringIterable(["a", "b", "c"])).toBe(true);
            expect(isStringIterable(new Set(["a", "b", "c"]))).toBe(true);
            expect(isStringIterable("abc")).toBe(true); // String is iterable of characters

            expect(isStringIterable(["a", 1, "c"])).toBe(false);
            expect(isStringIterable(new Set(["a", 1, "c"]))).toBe(false);
            expect(isStringIterable(123)).toBe(false);
        });

        it("should handle special cases isNever and isAny", () => {
            // Special case: isNever - should always return false for any iterable
            const isNeverIterable = isIterableOf(isNever);
            expect(isNeverIterable([])).toBe(false);
            expect(isNeverIterable(["a", "b", "c"])).toBe(false);
            expect(isNeverIterable(new Set([1, 2, 3]))).toBe(false);
            expect(isNeverIterable("abc")).toBe(false);

            // Special case: isAny - should always return true for any iterable
            const isAnyIterable = isIterableOf(isAny);
            expect(isAnyIterable([])).toBe(true);
            expect(isAnyIterable([1, "a", true])).toBe(true);
            expect(isAnyIterable(new Set([1, "a", true]))).toBe(true);
            expect(isAnyIterable("abc")).toBe(true);
        });
    });

    describe("isSetOf", () => {
        it("should check if a value is a Set of a specific type", () => {
            const isStringSet = isSetOf(isString);

            expect(isStringSet(new Set(["a", "b", "c"]))).toBe(true);
            expect(isStringSet(new Set())).toBe(true);
            expect(isStringSet(new Set(["a", 1, "c"]))).toBe(false);
            expect(isStringSet(["a", "b", "c"])).toBe(false);
            expect(isStringSet(null)).toBe(false);
        });
    });

    describe("isMapOf", () => {
        it("should check if a value is a Map with specific key and value types", () => {
            const isStringToNumberMap = isMapOf(isString, isNumber);

            const validMap = new Map();
            validMap.set("a", 1);
            validMap.set("b", 2);

            const invalidMap1 = new Map();
            invalidMap1.set("a", 1);
            invalidMap1.set(1, 2);

            const invalidMap2 = new Map();
            invalidMap2.set("a", 1);
            invalidMap2.set("b", "2");

            expect(isStringToNumberMap(validMap)).toBe(true);
            expect(isStringToNumberMap(new Map())).toBe(true);
            expect(isStringToNumberMap(invalidMap1)).toBe(false);
            expect(isStringToNumberMap(invalidMap2)).toBe(false);
            expect(isStringToNumberMap({})).toBe(false);
        });
    });

    describe("isRecordOf", () => {
        it("should check if a value is a Record with specific key and value types", () => {
            const isStringToNumberRecord = isRecordOf(isString, isNumber);

            expect(isStringToNumberRecord({ a: 1, b: 2 })).toBe(true);
            expect(isStringToNumberRecord({})).toBe(true);
            expect(isStringToNumberRecord({ a: "1" })).toBe(false);
            expect(isStringToNumberRecord([])).toBe(false);
            expect(isStringToNumberRecord(null)).toBe(false);
        });
    });

    describe("isAnyOf", () => {
        it("should check if a value matches any of the given inspectors", () => {
            const isStringOrNumber = isAnyOf(isString, isNumber);

            expect(isStringOrNumber("hello")).toBe(true);
            expect(isStringOrNumber(123)).toBe(true);
            expect(isStringOrNumber(true)).toBe(false);
            expect(isStringOrNumber(null)).toBe(false);
            expect(isStringOrNumber({})).toBe(false);
        });
    });

    describe("isAllOf", () => {
        it("should check if a value matches all of the given inspectors", () => {
            // A number that is also an integer
            const isIntegerNumber = isAllOf(isNumber, isInt);

            expect(isIntegerNumber(5)).toBe(true);
            expect(isIntegerNumber(5.5)).toBe(false);
            expect(isIntegerNumber("5")).toBe(false);

            // Custom inspectors for demonstration
            const isPositive = (x: any): x is number => isNumber(x) && x > 0;
            const isLessThan10 = (x: any): x is number => isNumber(x) && x < 10;

            const isPositiveIntLessThan10 = isAllOf(isInt, isPositive, isLessThan10);

            expect(isPositiveIntLessThan10(5)).toBe(true);
            expect(isPositiveIntLessThan10(0)).toBe(false);
            expect(isPositiveIntLessThan10(10)).toBe(false);
            expect(isPositiveIntLessThan10(5.5)).toBe(false);
        });
    });

    describe("isTupleOf", () => {
        it("should check if a value is a tuple with specific element types", () => {
            const isStringNumberBoolean = isTupleOf(isString, isNumber, isBoolean);

            expect(isStringNumberBoolean(["hello", 123, true])).toBe(true);
            expect(isStringNumberBoolean(["hello", 123, true, "extra"])).toBe(true); // No exact length check
            expect(isStringNumberBoolean(["hello", 123])).toBe(false); // Too short
            expect(isStringNumberBoolean(["hello", "123", true])).toBe(false); // Wrong type
            expect(isStringNumberBoolean({})).toBe(false);
        });
    });

    describe("isObjectOf", () => {
        it("should check if a value matches a specific object shape", () => {
            const isPerson = isObjectOf({
                name: isString,
                age: isNumber,
                isAdmin: isBoolean,
            });

            expect(isPerson({ name: "John", age: 30, isAdmin: false })).toBe(true);
            expect(isPerson({ name: "John", age: 30, isAdmin: false, extra: "field" })).toBe(true); // Extra fields allowed
            expect(isPerson({ name: "John", age: "30", isAdmin: false })).toBe(false); // Wrong type
            expect(isPerson({ name: "John", isAdmin: false })).toBe(false); // Missing field
            expect(isPerson(null)).toBe(false);
            expect(isPerson([])).toBe(false);
        });
    });

    describe("is (lazy evaluation)", () => {
        it("should allow circular references", () => {
            // Define a recursive structure type for type checking
            type TreeNode = {
                value: string;
                children: TreeNode[];
            };

            // This would normally cause a ReferenceError without lazy evaluation
            const isTreeNode = is(
                (): Inspector<TreeNode> =>
                    isObjectOf({
                        value: isString,
                        children: isArrayOf(isTreeNode),
                    })
            );

            const validTree = {
                value: "root",
                children: [
                    {
                        value: "child1",
                        children: [],
                    },
                    {
                        value: "child2",
                        children: [{ value: "grandchild", children: [] }],
                    },
                ],
            };

            const invalidTree = {
                value: "root",
                children: [
                    {
                        value: 123, // Invalid: not a string
                        children: [],
                    },
                ],
            };

            expect(isTreeNode(validTree)).toBe(true);
            expect(isTreeNode(invalidTree)).toBe(false);
        });
    });

    describe("isTupleOf with isOptional", () => {
        // Testing tuples with optional elements - similar to the README example
        const isPoint = isTupleOf(isNumber, isNumber, isOptional(isString));

        it("should accept tuples with all required elements", () => {
            expect(isPoint([10, 20, "Home"])).toBe(true);
        });

        it("should accept tuples with optional elements omitted", () => {
            expect(isPoint([10, 20])).toBe(true);
        });

        it("should reject tuples with wrong types for optional elements", () => {
            expect(isPoint([10, 20, 30])).toBe(false); // Third element should be string if present
        });

        it("should reject tuples with missing required elements", () => {
            expect(isPoint([10])).toBe(false); // Missing the second required number
        });

        // More complex example with multiple optional elements
        const isPerson = isTupleOf(
            isString, // name (required)
            isNumber, // age (required)
            isOptional(isString), // email (optional)
            isOptional(isBoolean) // isActive (optional)
        );

        it("should accept tuples with all elements", () => {
            expect(isPerson(["John", 30, "john@example.com", true])).toBe(true);
        });

        it("should accept tuples with some optional elements", () => {
            expect(isPerson(["John", 30, "john@example.com"])).toBe(true);
        });

        it("should accept tuples with only required elements", () => {
            expect(isPerson(["John", 30])).toBe(true);
        });

        it("should reject tuples with incorrect types", () => {
            expect(isPerson(["John", "30"])).toBe(false); // Age should be number
            expect(isPerson(["John", 30, 123])).toBe(false); // Email should be string if present
            expect(isPerson(["John", 30, "john@example.com", "yes"])).toBe(false); // isActive should be boolean
        });

        // Nested optional elements
        const isComplexData = isTupleOf(
            isString, // identifier
            isArrayOf(isNumber), // values
            isOptional(isTupleOf(isString, isOptional(isNumber))) // metadata
        );

        it("should accept complex tuples with nested optionals", () => {
            expect(isComplexData(["id123", [1, 2, 3], ["meta", 42]])).toBe(true); // Full data
            expect(isComplexData(["id123", [1, 2, 3], ["meta"]])).toBe(true); // Metadata without optional number
            expect(isComplexData(["id123", [1, 2, 3]])).toBe(true); // No metadata
        });

        it("should reject invalid complex tuples", () => {
            expect(isComplexData(["id123", [1, "2", 3]])).toBe(false); // Invalid number in array
            expect(isComplexData(["id123", [1, 2, 3], [42, "meta"]])).toBe(false); // Wrong order in metadata
        });
    });
});
