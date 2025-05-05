import { describe, it, expect } from "vitest";
import {
    isDate,
    isSet,
    isMap,
    isPromise,
    isArrayLike,
    isPromiseLike,
    isFunction,
    isClass,
    isInstance,
    isIterable,
    isIterator,
    isRegExp,
} from "~/inspect";

describe("Built-in Type Inspectors", () => {
    describe("isDate", () => {
        it("should return true for Date objects", () => {
            expect(isDate(new Date())).toBe(true);
            expect(isDate(new Date(2025, 4, 5))).toBe(true); // May 5, 2025
            expect(isDate(new Date("2025-05-05T12:00:00Z"))).toBe(true);
        });

        it("should return false for non-Date objects", () => {
            expect(isDate("2021-01-01")).toBe(false);
            expect(isDate(1620000000000)).toBe(false); // timestamp
            expect(isDate({ getTime: () => 1620000000000 })).toBe(false); // Date-like
            expect(isDate(null)).toBe(false);
            expect(isDate(undefined)).toBe(false);
            expect(isDate({})).toBe(false);
        });
    });

    describe("isSet", () => {
        it("should return true for Set objects", () => {
            expect(isSet(new Set())).toBe(true);
            expect(isSet(new Set([1, 2, 3]))).toBe(true);
            expect(isSet(new Set(["a", "b", "c"]))).toBe(true);

            // Set with different item types
            const mixedSet = new Set();
            mixedSet.add(1);
            mixedSet.add("string");
            mixedSet.add({});
            expect(isSet(mixedSet)).toBe(true);
        });

        it("should return false for non-Set objects", () => {
            expect(isSet([])).toBe(false);
            expect(isSet({})).toBe(false);
            expect(isSet(null)).toBe(false);
            expect(isSet(undefined)).toBe(false);
            expect(isSet(new Map())).toBe(false);
            expect(isSet({ add: () => {}, has: () => {}, delete: () => {} })).toBe(false); // Set-like
        });
    });

    describe("isMap", () => {
        it("should return true for Map objects", () => {
            expect(isMap(new Map())).toBe(true);

            const map1 = new Map();
            map1.set("key1", "value1");
            map1.set("key2", "value2");
            expect(isMap(map1)).toBe(true);

            const map2 = new Map([
                ["key1", "value1"],
                ["key2", "value2"],
            ]);
            expect(isMap(map2)).toBe(true);

            // Map with various key and value types
            const mixedMap = new Map();
            mixedMap.set("string", 123);
            mixedMap.set(456, "text");
            mixedMap.set({}, []);
            expect(isMap(mixedMap)).toBe(true);
        });

        it("should return false for non-Map objects", () => {
            expect(isMap({})).toBe(false);
            expect(isMap([])).toBe(false);
            expect(isMap(null)).toBe(false);
            expect(isMap(undefined)).toBe(false);
            expect(isMap(new Set())).toBe(false);
            expect(isMap({ get: () => {}, set: () => {}, has: () => {} })).toBe(false); // Map-like
        });
    });

    describe("isPromise", () => {
        it("should return true for Promise objects", () => {
            expect(isPromise(Promise.resolve())).toBe(true);
            expect(isPromise(Promise.reject().catch(() => {}))).toBe(true);
            expect(isPromise(new Promise((resolve) => resolve(true)))).toBe(true);
            expect(isPromise(new Promise((resolve, _reject) => _reject(new Error())).catch(() => {}))).toBe(true);
        });

        it("should return false for promise-like objects that aren't actual Promises", () => {
            expect(isPromise({ then: () => {}, catch: () => {} })).toBe(false);
            expect(isPromise({ then: () => {} })).toBe(false);
        });

        it("should return false for non-Promise objects", () => {
            expect(isPromise({})).toBe(false);
            expect(isPromise([])).toBe(false);
            expect(isPromise(null)).toBe(false);
            expect(isPromise(undefined)).toBe(false);
            expect(isPromise(() => {})).toBe(false);
        });
    });

    describe("isArrayLike", () => {
        it("should return true for array-like objects", () => {
            expect(isArrayLike([])).toBe(true);
            expect(isArrayLike([1, 2, 3])).toBe(true);
            expect(isArrayLike("string")).toBe(true); // strings are array-like

            // Function arguments
            function testFunc(...args: number[]) {
                expect(isArrayLike(arguments)).toBe(true);
                expect(isArrayLike(args)).toBe(true);
            }
            testFunc(1, 2, 3);

            // TypedArrays
            expect(isArrayLike(new Uint8Array([1, 2, 3]))).toBe(true);
            expect(isArrayLike(new Int32Array([1, 2, 3]))).toBe(true);
            expect(isArrayLike(new Float64Array([1.1, 2.2, 3.3]))).toBe(true);

            // Custom array-like object
            const arrayLike = { length: 3, 0: "a", 1: "b", 2: "c" };
            expect(isArrayLike(arrayLike)).toBe(true);

            // The implementation accepts negative lengths
            const negativeLength = { length: -1 };
            expect(isArrayLike(negativeLength)).toBe(true);
        });

        it("should return false for non-array-like objects", () => {
            expect(isArrayLike({})).toBe(false);
            expect(isArrayLike({ length: "not a number" })).toBe(false);
            // The implementation doesn't accept non-integer lengths
            const floatLength = { length: 1.5 };
            expect(isArrayLike(floatLength)).toBe(false);
            expect(isArrayLike(null)).toBe(false);
            expect(isArrayLike(undefined)).toBe(false);
            expect(isArrayLike(42)).toBe(false);
            expect(isArrayLike(true)).toBe(false);

            // Test objects with property access but missing length property
            const objectWithoutLength = { foo: "bar" };
            expect(isArrayLike(objectWithoutLength)).toBe(false);

            // Test object with undefined length
            const objectWithUndefinedLength = { length: undefined };
            expect(isArrayLike(objectWithUndefinedLength)).toBe(false);

            // Test objects with NaN length
            const objectWithNaNLength = { length: NaN };
            expect(isArrayLike(objectWithNaNLength)).toBe(false);
        });

        it("should specifically test non-integer length cases", () => {
            // This test is specifically targeting lines 245-246 in inspect.ts

            // Object with non-integer length that isn't null/undefined/falsy (to bypass first check)
            // and isn't an Array (to bypass second check)
            const floatLength = { length: 1.5 };
            expect(isArrayLike(floatLength)).toBe(false);

            const stringLength = { length: "3" };
            expect(isArrayLike(stringLength)).toBe(false);

            // Test with Boolean length
            const boolLength = { length: true };
            expect(isArrayLike(boolLength)).toBe(false);

            // Test with Infinity length
            const infinityLength = { length: Infinity };
            expect(isArrayLike(infinityLength)).toBe(false);
        });
    });

    describe("isPromiseLike", () => {
        it("should return true for Promise and promise-like objects", () => {
            expect(isPromiseLike(Promise.resolve())).toBe(true);
            expect(isPromiseLike(Promise.reject().catch(() => {}))).toBe(true);
            expect(isPromiseLike(new Promise((resolve) => resolve(true)))).toBe(true);

            // Promise-like objects
            expect(isPromiseLike({ then: () => {} })).toBe(true);
            expect(isPromiseLike({ then: function () {} })).toBe(true);

            // More complex promise-like object
            const promiseLike = {
                then: (_resolve: any, _reject: any) => {
                    _resolve("result");
                    return promiseLike;
                },
            };
            expect(isPromiseLike(promiseLike)).toBe(true);
        });

        it("should return false for non-promise-like objects", () => {
            expect(isPromiseLike({})).toBe(false);
            expect(isPromiseLike({ then: "not a function" })).toBe(false);
            expect(isPromiseLike([])).toBe(false);
            expect(isPromiseLike(null)).toBe(false);
            expect(isPromiseLike(undefined)).toBe(false);
            expect(isPromiseLike(42)).toBe(false);
            expect(isPromiseLike(() => {})).toBe(false);
        });
    });

    describe("isFunction", () => {
        it("should return true for all function types", () => {
            // Regular functions
            expect(isFunction(() => {})).toBe(true);
            expect(isFunction(function () {})).toBe(true);
            expect(isFunction(function named() {})).toBe(true);

            // Built-in functions
            expect(isFunction(Array.isArray)).toBe(true);
            expect(isFunction(Object.keys)).toBe(true);
            expect(isFunction(isFunction)).toBe(true);

            // ES6 classes (which are functions)
            expect(isFunction(class {})).toBe(true);
            expect(isFunction(class Named {})).toBe(true);

            // Functions with properties
            const funcWithProps = () => {};
            funcWithProps.prop = "value";
            expect(isFunction(funcWithProps)).toBe(true);

            // Generator functions
            expect(
                isFunction(function* () {
                    yield 1;
                })
            ).toBe(true);

            // Async functions
            expect(isFunction(async function () {})).toBe(true);
            expect(isFunction(async () => {})).toBe(true);
        });

        it("should return false for non-function values", () => {
            expect(isFunction({})).toBe(false);
            expect(isFunction([])).toBe(false);
            expect(isFunction(null)).toBe(false);
            expect(isFunction(undefined)).toBe(false);
            expect(isFunction(42)).toBe(false);
            expect(isFunction("function")).toBe(false);
            expect(isFunction(true)).toBe(false);

            // Instance of a class (not a function)
            class Test {}
            expect(isFunction(new Test())).toBe(false);

            // Function-like object
            expect(isFunction({ call: () => {}, apply: () => {} })).toBe(false);
        });
    });

    describe("isClass", () => {
        it("should return true for ES6 classes", () => {
            expect(isClass(class {})).toBe(true);
            expect(isClass(class TestClass {})).toBe(true);

            // Class with methods and properties
            expect(
                isClass(
                    class {
                        public prop: number;
                        constructor() {
                            this.prop = 1;
                        }
                        method() {}
                        static staticMethod() {}
                    }
                )
            ).toBe(true);

            // Class with inheritance
            expect(isClass(class Child extends class Parent {} {})).toBe(true);
        });

        it("should return false for regular functions", () => {
            expect(isClass(() => {})).toBe(false);
            expect(isClass(function () {})).toBe(false);
            expect(isClass(function named() {})).toBe(false);
        });

        it("should return false for other values", () => {
            expect(isClass({})).toBe(false);
            expect(isClass([])).toBe(false);
            expect(isClass(null)).toBe(false);
            expect(isClass(undefined)).toBe(false);
            expect(isClass("class")).toBe(false);

            // Class instance (not a class)
            class Test {}
            expect(isClass(new Test())).toBe(false);
        });

        it("should handle edge cases", () => {
            // Function created with Function constructor
            expect(isClass(new Function("return class {}")())).toBe(true);
            expect(isClass(Function("return class {}")())).toBe(true);
        });
    });

    describe("isInstance", () => {
        it("should return true for instances of classes", () => {
            class TestClass {}
            class ChildClass extends TestClass {}

            expect(isInstance(new TestClass())).toBe(true);
            expect(isInstance(new ChildClass())).toBe(true);
            expect(isInstance(new Date())).toBe(true);
            expect(isInstance(new String("test"))).toBe(true);
            expect(isInstance(new Number(42))).toBe(true);
            expect(isInstance(new Boolean(true))).toBe(true);
            expect(isInstance(new Array())).toBe(true);
            expect(isInstance(new Set())).toBe(true);
            expect(isInstance(new Map())).toBe(true);
            expect(isInstance(new RegExp("test"))).toBe(true);
            expect(isInstance(new Error())).toBe(true);

            // DOM objects in a browser environment
            if (typeof document !== "undefined") {
                expect(isInstance(document.createElement("div"))).toBe(true);
            }
        });

        it("should return false for non-instance objects", () => {
            expect(isInstance({})).toBe(false);
            expect(isInstance(Object.create(null))).toBe(false);

            // Primitive values
            expect(isInstance(null)).toBe(false);
            expect(isInstance(undefined)).toBe(false);
            expect(isInstance(42)).toBe(false);
            expect(isInstance("string")).toBe(false);
            expect(isInstance(true)).toBe(false);
            expect(isInstance(Symbol())).toBe(false);

            // Function (not an instance)
            expect(isInstance(() => {})).toBe(false);
            expect(isInstance(function () {})).toBe(false);

            // Class (not an instance)
            expect(isInstance(class {})).toBe(false);
        });
    });

    describe("isIterable", () => {
        it("should return true for iterable objects", () => {
            // Built-in iterables
            expect(isIterable([])).toBe(true);
            expect(isIterable([1, 2, 3])).toBe(true);
            expect(isIterable("string")).toBe(true);
            expect(isIterable(new Set())).toBe(true);
            expect(isIterable(new Set([1, 2, 3]))).toBe(true);
            expect(isIterable(new Map())).toBe(true);
            expect(
                isIterable(
                    new Map([
                        ["a", 1],
                        ["b", 2],
                    ])
                )
            ).toBe(true);

            // TypedArrays
            expect(isIterable(new Uint8Array([1, 2, 3]))).toBe(true);
            expect(isIterable(new Int32Array([1, 2, 3]))).toBe(true);

            // Custom iterables
            const iterable = {
                [Symbol.iterator]: function* () {
                    yield 1;
                    yield 2;
                    yield 3;
                },
            };
            expect(isIterable(iterable)).toBe(true);

            // Generator objects
            function* generator() {
                yield 1;
                yield 2;
            }
            expect(isIterable(generator())).toBe(true);

            // The current implementation considers objects with any Symbol.iterator to be iterable,
            // regardless of whether it's a function that returns an iterator
            const badIterable1 = { [Symbol.iterator]: () => {} };
            expect(isIterable(badIterable1)).toBe(true);

            const badIterable2 = { [Symbol.iterator]: () => ({ next: "not a function" }) };
            expect(isIterable(badIterable2)).toBe(true);
        });

        it("should return false for non-iterable values", () => {
            expect(isIterable({})).toBe(false);
            expect(isIterable({ length: 3 })).toBe(false); // array-like but not iterable
            expect(isIterable(null)).toBe(false);
            expect(isIterable(undefined)).toBe(false);
            expect(isIterable(42)).toBe(false);
            expect(isIterable(true)).toBe(false);
            expect(isIterable(Symbol())).toBe(false);
            expect(isIterable(() => {})).toBe(false);

            // Objects with incorrect Symbol.iterator
            expect(isIterable({ [Symbol.iterator]: "not a function" })).toBe(false);
        });
    });

    describe("isIterator", () => {
        it("should return true for iterator objects", () => {
            // Array iterators
            expect(isIterator([].values())).toBe(true);
            expect(isIterator([].keys())).toBe(true);
            expect(isIterator([].entries())).toBe(true);
            expect(isIterator([1, 2, 3][Symbol.iterator]())).toBe(true);

            // String iterators
            expect(isIterator("abc"[Symbol.iterator]())).toBe(true);

            // Set and Map iterators
            expect(isIterator(new Set([1, 2, 3]).values())).toBe(true);
            expect(
                isIterator(
                    new Map([
                        ["a", 1],
                        ["b", 2],
                    ]).entries()
                )
            ).toBe(true);

            // Generator object (is an iterator)
            function* gen() {
                yield 1;
                yield 2;
            }
            expect(isIterator(gen())).toBe(true);

            // Custom iterator
            const iterator = {
                next: () => ({ value: 1, done: false }),
            };
            expect(isIterator(iterator)).toBe(true);

            // More complex iterator
            const iteratorWithReturn = {
                next: () => ({ value: 1, done: false }),
                return: () => ({ done: true }),
            };
            expect(isIterator(iteratorWithReturn)).toBe(true);
        });

        it("should return false for non-iterator values", () => {
            // Iterables are not iterators
            expect(isIterator([])).toBe(false);
            expect(isIterator("string")).toBe(false);
            expect(isIterator(new Set())).toBe(false);
            expect(isIterator(new Map())).toBe(false);

            // Other non-iterators
            expect(isIterator({})).toBe(false);
            expect(isIterator(null)).toBe(false);
            expect(isIterator(undefined)).toBe(false);
            expect(isIterator(42)).toBe(false);
            expect(isIterator(true)).toBe(false);
            expect(isIterator(() => {})).toBe(false);

            // Objects with incorrect next property
            expect(isIterator({ next: "not a function" })).toBe(false);
        });
    });

    describe("isRegExp", () => {
        it("should return true for RegExp objects", () => {
            expect(isRegExp(/test/)).toBe(true);
            expect(isRegExp(/test/g)).toBe(true);
            expect(isRegExp(/test/i)).toBe(true);
            expect(isRegExp(/test/m)).toBe(true);
            expect(isRegExp(/test/u)).toBe(true);
            expect(isRegExp(new RegExp("test"))).toBe(true);
            expect(isRegExp(new RegExp("test", "g"))).toBe(true);
            expect(isRegExp(RegExp("test"))).toBe(true);
        });

        it("should return false for non-RegExp values", () => {
            expect(isRegExp({})).toBe(false);
            expect(isRegExp({ test: () => {}, exec: () => {} })).toBe(false); // RegExp-like
            expect(isRegExp("/test/")).toBe(false); // string that looks like regex
            expect(isRegExp(null)).toBe(false);
            expect(isRegExp(undefined)).toBe(false);
            expect(isRegExp(42)).toBe(false);
            expect(isRegExp(true)).toBe(false);
            expect(isRegExp(() => {})).toBe(false);
        });
    });
});
