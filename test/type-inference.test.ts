import { describe, it, expect } from "vitest";
import {
    isString,
    isNumber,
    isBoolean,
    isInt,
    isArrayOf,
    isTupleOf,
    isObjectOf,
    isAnyOf,
    isMapOf,
    isRecordOf,
    isOptional,
    isNullable,
    Inspected,
} from "~/inspect";

// These tests primarily check TypeScript typing rather than runtime functionality
// They ensure type inference works correctly with the Inspected utility type
describe("Type Inference with Inspected", () => {
    it("should infer primitive types correctly", () => {
        // Declare inspectors
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isStringInspector = isString;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isNumberInspector = isNumber;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isIntInspector = isInt;

        // Infer types with Inspected
        type InferredString = Inspected<typeof isStringInspector>;
        type InferredNumber = Inspected<typeof isNumberInspector>;
        type InferredInt = Inspected<typeof isIntInspector>;

        // Create test values
        const testString: InferredString = "hello";
        const testNumber: InferredNumber = 42;
        const testInt: InferredInt = 42;

        // Runtime checks to ensure the types match
        expect(isString(testString)).toBe(true);
        expect(isNumber(testNumber)).toBe(true);
        expect(isInt(testInt)).toBe(true);
    });

    it("should infer array types correctly", () => {
        // Declare array inspector
        const isStringArray = isArrayOf(isString);

        // Infer array type with Inspected
        type StringArray = Inspected<typeof isStringArray>;

        // Create test value
        const testArray: StringArray = ["a", "b", "c"];

        // Runtime check
        expect(isStringArray(testArray)).toBe(true);
    });

    it("should infer tuple types correctly", () => {
        // Declare tuple inspector
        const isStringNumberBooleanTuple = isTupleOf(isString, isNumber, isBoolean);

        // Infer tuple type with Inspected
        type StringNumberBooleanTuple = Inspected<typeof isStringNumberBooleanTuple>;

        // Create test value
        const testTuple: StringNumberBooleanTuple = ["hello", 42, true];

        // Runtime check
        expect(isStringNumberBooleanTuple(testTuple)).toBe(true);
    });

    it("should infer object types correctly", () => {
        // Declare object inspector
        const isPerson = isObjectOf({
            name: isString,
            age: isNumber,
            isAdmin: isBoolean,
            tags: isArrayOf(isString),
        });

        // Infer object type with Inspected
        type Person = Inspected<typeof isPerson>;

        // Create test value
        const testPerson: Person = {
            name: "John",
            age: 30,
            isAdmin: false,
            tags: ["user", "customer"],
        };

        // Runtime check
        expect(isPerson(testPerson)).toBe(true);
    });

    it("should infer union types correctly", () => {
        // Declare union inspector
        const isStringOrNumber = isAnyOf(isString, isNumber);

        // Infer union type with Inspected
        type StringOrNumber = Inspected<typeof isStringOrNumber>;

        // Create test values
        const testString: StringOrNumber = "hello";
        const testNumber: StringOrNumber = 42;

        // Runtime checks
        expect(isStringOrNumber(testString)).toBe(true);
        expect(isStringOrNumber(testNumber)).toBe(true);
    });

    it("should infer Map types correctly", () => {
        // Declare Map inspector
        const isStringNumberMap = isMapOf(isString, isNumber);

        // Infer Map type with Inspected
        type StringNumberMap = Inspected<typeof isStringNumberMap>;

        // Create test value
        const testMap: StringNumberMap = new Map();
        testMap.set("a", 1);
        testMap.set("b", 2);

        // Runtime check
        expect(isStringNumberMap(testMap)).toBe(true);
    });

    it("should infer Record types correctly", () => {
        // Declare Record inspector
        const isStringNumberRecord = isRecordOf(isString, isNumber);

        // Infer Record type with Inspected
        type StringNumberRecord = Inspected<typeof isStringNumberRecord>;

        // Create test value
        const testRecord: StringNumberRecord = {
            a: 1,
            b: 2,
        };

        // Runtime check
        expect(isStringNumberRecord(testRecord)).toBe(true);
    });

    it("should infer optional types correctly", () => {
        // Declare optional inspector
        const isOptionalString = isOptional(isString);

        // Infer optional type with Inspected
        type OptionalString = Inspected<typeof isOptionalString>;

        // Create test values
        const testString: OptionalString = "hello";
        const testUndefined: OptionalString = undefined;

        // Runtime checks
        expect(isOptionalString(testString)).toBe(true);
        expect(isOptionalString(testUndefined)).toBe(true);
    });

    it("should infer nullable types correctly", () => {
        // Declare nullable inspector
        const isNullableNumber = isNullable(isNumber);

        // Infer nullable type with Inspected
        type NullableNumber = Inspected<typeof isNullableNumber>;

        // Create test values
        const testNumber: NullableNumber = 42;
        const testNull: NullableNumber = null;

        // Runtime checks
        expect(isNullableNumber(testNumber)).toBe(true);
        expect(isNullableNumber(testNull)).toBe(true);
    });

    it("should infer complex nested types correctly", () => {
        // Declare complex inspector
        const isUserProfile = isObjectOf({
            id: isString,
            user: isObjectOf({
                name: isString,
                age: isNumber,
                email: isOptional(isString),
            }),
            preferences: isRecordOf(isString, isAnyOf(isString, isNumber, isBoolean)),
            friends: isArrayOf(isString),
            loginHistory: isArrayOf(
                isObjectOf({
                    timestamp: isNumber,
                    device: isString,
                })
            ),
        });

        // Infer complex type with Inspected
        type UserProfile = Inspected<typeof isUserProfile>;

        // Create test value
        const testProfile: UserProfile = {
            id: "user123",
            user: {
                name: "John",
                age: 30,
                email: "john@example.com",
            },
            preferences: {
                theme: "dark",
                fontSize: 16,
                notifications: true,
            },
            friends: ["user456", "user789"],
            loginHistory: [
                { timestamp: 1620000000000, device: "mobile" },
                { timestamp: 1620100000000, device: "desktop" },
            ],
        };

        // Runtime check
        expect(isUserProfile(testProfile)).toBe(true);
    });
});
