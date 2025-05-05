import { describe, it, expect } from "vitest";
import {
    isAny,
    isNever,
    isPrimitive,
    isUndefined,
    isNull,
    isNullish,
    isBoolean,
    isNumber,
    isInt,
    isUInt32,
    isUInt8,
    isBigInt,
    isString,
    isArray,
    isObject,
    isStruct,
    isRecord,
    isPlainObject,
} from "~/index";

describe("Primitive Inspectors", () => {
    describe("isAny", () => {
        it("should return true for any value", () => {
            expect(isAny(null)).toBe(true);
            expect(isAny(undefined)).toBe(true);
            expect(isAny(0)).toBe(true);
            expect(isAny(true)).toBe(true);
            expect(isAny("string")).toBe(true);
            expect(isAny({})).toBe(true);
            expect(isAny([])).toBe(true);
            expect(isAny(Symbol())).toBe(true);
        });
    });

    describe("isNever", () => {
        it("should return false for any value", () => {
            expect(isNever(null)).toBe(false);
            expect(isNever(undefined)).toBe(false);
            expect(isNever(0)).toBe(false);
            expect(isNever(true)).toBe(false);
            expect(isNever("string")).toBe(false);
            expect(isNever({})).toBe(false);
            expect(isNever([])).toBe(false);
            expect(isNever(Symbol())).toBe(false);
        });
    });

    describe("isPrimitive", () => {
        it("should return true for primitive values", () => {
            expect(isPrimitive(null)).toBe(true);
            expect(isPrimitive(undefined)).toBe(true);
            expect(isPrimitive(0)).toBe(true);
            expect(isPrimitive(true)).toBe(true);
            expect(isPrimitive("string")).toBe(true);
        });

        it("should return false for non-primitive values", () => {
            expect(isPrimitive({})).toBe(false);
            expect(isPrimitive([])).toBe(false);
            expect(isPrimitive(Symbol())).toBe(false);
            expect(isPrimitive(() => {})).toBe(false);
        });
    });

    describe("isUndefined", () => {
        it("should return true for undefined", () => {
            expect(isUndefined(undefined)).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isUndefined(null)).toBe(false);
            expect(isUndefined(0)).toBe(false);
            expect(isUndefined("")).toBe(false);
            expect(isUndefined(false)).toBe(false);
            expect(isUndefined({})).toBe(false);
        });
    });

    describe("isNull", () => {
        it("should return true for null", () => {
            expect(isNull(null)).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isNull(undefined)).toBe(false);
            expect(isNull(0)).toBe(false);
            expect(isNull("")).toBe(false);
            expect(isNull(false)).toBe(false);
            expect(isNull({})).toBe(false);
        });
    });

    describe("isNullish", () => {
        it("should return true for null and undefined", () => {
            expect(isNullish(null)).toBe(true);
            expect(isNullish(undefined)).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isNullish(0)).toBe(false);
            expect(isNullish("")).toBe(false);
            expect(isNullish(false)).toBe(false);
            expect(isNullish({})).toBe(false);
        });
    });

    describe("isBoolean", () => {
        it("should return true for boolean values", () => {
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(false)).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isBoolean(null)).toBe(false);
            expect(isBoolean(undefined)).toBe(false);
            expect(isBoolean(0)).toBe(false);
            expect(isBoolean("true")).toBe(false);
            expect(isBoolean({})).toBe(false);
        });
    });

    describe("isNumber", () => {
        it("should return true for number values", () => {
            expect(isNumber(0)).toBe(true);
            expect(isNumber(1)).toBe(true);
            expect(isNumber(-1)).toBe(true);
            expect(isNumber(1.5)).toBe(true);
            expect(isNumber(Infinity)).toBe(true);
            expect(isNumber(NaN)).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
            expect(isNumber("0")).toBe(false);
            expect(isNumber(true)).toBe(false);
            expect(isNumber({})).toBe(false);
        });
    });

    describe("isInt", () => {
        it("should return true for integer values", () => {
            expect(isInt(0)).toBe(true);
            expect(isInt(1)).toBe(true);
            expect(isInt(-1)).toBe(true);
            expect(isInt(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(isInt(Number.MIN_SAFE_INTEGER)).toBe(true);
        });

        it("should return false for non-integer numbers", () => {
            expect(isInt(1.5)).toBe(false);
            expect(isInt(Infinity)).toBe(false);
            expect(isInt(NaN)).toBe(false);
        });

        it("should return false for any other value", () => {
            expect(isInt(null)).toBe(false);
            expect(isInt(undefined)).toBe(false);
            expect(isInt("0")).toBe(false);
            expect(isInt(true)).toBe(false);
        });
    });

    describe("isUInt32", () => {
        it("should return true for unsigned 32-bit integers", () => {
            expect(isUInt32(0)).toBe(true);
            expect(isUInt32(1)).toBe(true);
            expect(isUInt32(4294967295)).toBe(true); // 2^32 - 1
        });

        it("should return false for negative or out-of-range integers", () => {
            expect(isUInt32(-1)).toBe(false);
            expect(isUInt32(4294967296)).toBe(false); // 2^32
        });

        it("should return false for any other value", () => {
            expect(isUInt32(1.5)).toBe(false);
            expect(isUInt32(null)).toBe(false);
            expect(isUInt32("0")).toBe(false);
        });
    });

    describe("isUInt8", () => {
        it("should return true for integers between 0 and 255", () => {
            expect(isUInt8(0)).toBe(true);
            expect(isUInt8(1)).toBe(true);
            expect(isUInt8(255)).toBe(true);
        });

        it("should return false for out-of-range integers", () => {
            expect(isUInt8(-1)).toBe(false);
            expect(isUInt8(256)).toBe(false);
        });

        it("should return false for any other value", () => {
            expect(isUInt8(1.5)).toBe(false);
            expect(isUInt8(null)).toBe(false);
            expect(isUInt8("0")).toBe(false);
        });
    });

    describe("isBigInt", () => {
        it("should return true for BigInt values", () => {
            expect(isBigInt(BigInt(0))).toBe(true);
            expect(isBigInt(BigInt(9007199254740991))).toBe(true);
            expect(isBigInt(BigInt(-9007199254740991))).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isBigInt(0)).toBe(false);
            expect(isBigInt("0")).toBe(false);
            expect(isBigInt(null)).toBe(false);
        });
    });

    describe("isString", () => {
        it("should return true for string values", () => {
            expect(isString("")).toBe(true);
            expect(isString("hello")).toBe(true);
            expect(isString(String("hello"))).toBe(true);
            expect(isString(new String("hello"))).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isString(0)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
            expect(isString([])).toBe(false);
        });
    });

    describe("isArray", () => {
        it("should return true for arrays", () => {
            expect(isArray([])).toBe(true);
            expect(isArray([1, 2, 3])).toBe(true);
            expect(isArray(new Array())).toBe(true);
        });

        it("should return false for any other value", () => {
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
            expect(isArray({})).toBe(false);
            expect(isArray("[]")).toBe(false);
            expect(isArray(new Set())).toBe(false);
        });
    });

    describe("isObject", () => {
        it("should return true for objects", () => {
            expect(isObject({})).toBe(true);
            expect(isObject([])).toBe(true);
            expect(isObject(new Date())).toBe(true);
            expect(isObject(new Set())).toBe(true);
        });

        it("should return false for primitives", () => {
            expect(isObject(null)).toBe(false);
            expect(isObject(undefined)).toBe(false);
            expect(isObject(0)).toBe(false);
            expect(isObject("string")).toBe(false);
            expect(isObject(true)).toBe(false);
            expect(isObject(Symbol())).toBe(false);
        });
    });

    describe("isStruct and isRecord", () => {
        it("should return true for plain objects", () => {
            expect(isStruct({})).toBe(true);
            expect(isStruct({ a: 1 })).toBe(true);
            expect(isRecord({})).toBe(true);
            expect(isRecord({ a: 1 })).toBe(true);

            // Object with null prototype
            const nullProto = Object.create(null);
            nullProto.a = 1;
            expect(isStruct(nullProto)).toBe(true);
            expect(isRecord(nullProto)).toBe(true);
        });

        it("should return false for classes and instances", () => {
            class Test {}
            const instance = new Test();

            expect(isStruct(instance)).toBe(false);
            expect(isRecord(instance)).toBe(false);
            expect(isStruct(new Date())).toBe(false);
            expect(isRecord(new Date())).toBe(false);
        });

        it("should return false for arrays and other collections", () => {
            expect(isStruct([])).toBe(false);
            expect(isRecord([])).toBe(false);
            expect(isStruct(new Set())).toBe(false);
            expect(isRecord(new Set())).toBe(false);
            expect(isStruct(new Map())).toBe(false);
            expect(isRecord(new Map())).toBe(false);
        });
    });

    describe("isPlainObject (deprecated)", () => {
        it("should return true for plain objects with Object.prototype", () => {
            expect(isPlainObject({})).toBe(true);
            expect(isPlainObject({ a: 1 })).toBe(true);

            // This is specifically to test line 245 in inspect.ts
            const obj = {};
            expect((obj as any).__proto__ === Object.prototype).toBe(true);
            expect(isPlainObject(obj)).toBe(true);
        });

        it("should return false for objects with null prototype", () => {
            // Object with null prototype
            const nullProto = Object.create(null);
            nullProto.a = 1;
            expect(isPlainObject(nullProto)).toBe(false);
        });

        it("should return false for classes and instances", () => {
            class Test {}
            const instance = new Test();

            expect(isPlainObject(instance)).toBe(false);
            expect(isPlainObject(new Date())).toBe(false);
        });

        it("should return false for arrays and other collections", () => {
            expect(isPlainObject([])).toBe(false);
            expect(isPlainObject(new Set())).toBe(false);
            expect(isPlainObject(new Map())).toBe(false);
        });

        it("should return false for primitives", () => {
            expect(isPlainObject(null)).toBe(false);
            expect(isPlainObject(undefined)).toBe(false);
            expect(isPlainObject(42)).toBe(false);
            expect(isPlainObject("string")).toBe(false);
            expect(isPlainObject(true)).toBe(false);
        });
    });
});
