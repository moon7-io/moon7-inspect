/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * Runtime type-checking
 * For checking against data from external sources.
 *
 * `Inspect` checks if a value matches a given type.
 * `Validate` verifies that a value is within some constraints.
 * `Parse` parses a string using a given grammar into some structure, or throws an error.
 */
type int = number;
type byte = number;
type Class<T> = new (...args: any[]) => T;

interface Struct<T> {
    [name: string]: T;
    [name: number]: T;
    [name: symbol]: T;
}

export type Inspector<T> = (value: any) => value is T;
export type Inspected<T> = T extends Inspector<infer R> ? R : never;
export type Predicate<T> = (value: T) => boolean;
export type CheckType<T> = T extends (value: any) => value is infer R ? R : never;
export type Shape<T> = { [K in keyof T]-?: Inspector<T[K]> };

// get the indexes of a tuple. ArgIndex<["foo", "bar", "baz"]> ==> "0" | "1" | "2"
type ArgIndex<T> = Exclude<keyof T, keyof Array<any>>;
// TupleUnion<[Inspector<A>, Inspector<B>, Inspector<C>]>; ==> { "0": A, "1": B, "2": C }
type ArgTypes<T> = { [K in ArgIndex<T>]: CheckType<T[K]> };
// A | B | C
type TupleUnion<T> = { [K in keyof T]: T[K] }[keyof T];

type Union<T> = TupleUnion<ArgTypes<T>>;
type Tuple<T> = { [K in keyof T]: CheckType<T[K]> };

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/*----------------------------------------------------------------------
    Lazy Inspector
----------------------------------------------------------------------*/

/**
 * A lazy inspector, so you can reference other inspectors out of
 * declare sequence.
 *
 * @example
 * const isFoo = isObjectOf({
 *     a: isBar,            // error: used before being assigned
 *     b: is(() => isBar),  // ok
 * });
 *
 * const isBar = isObjectOf({ ... });
 */
export function is<T>(lazy: () => Inspector<T>): Inspector<T> {
    return (x: any): x is T => {
        const isT = lazy();
        return isT(x);
    };
}

/*----------------------------------------------------------------------
    Basic Inspectors
----------------------------------------------------------------------*/

/**
 * Always returns true
 * @param x value to inspect
 */
export function isAny(x: any): x is any {
    return true;
}

/**
 * Always returns false
 * @param x value to inspect
 */
export function isNever(x: any): x is never {
    return false;
}

/**
 * Checks if x is null, undefined, number, string, or boolean
 * @param x value to inspect
 * @returns true if x is a primitive value
 */
export function isPrimitive(x: any): x is null | undefined | number | string | boolean {
    return isNullish(x) || isNumber(x) || isString(x) || isBoolean(x);
}

/**
 * Checks if x is undefined
 * @param x value to inspect
 */
export function isUndefined(x: any): x is undefined {
    return x === undefined;
}

/**
 * Checks if x is a null value
 * @param x value to inspect
 */
export function isNull(x: any): x is null {
    return x === null;
}

/**
 * Checks if x is either null or undefined
 * @param x value to inspect
 */
export function isNullish(x: any): x is undefined | null {
    // non-strict equality will be true for undefined as well
    return x == null;
}

/**
 * Checks if x is a boolean
 * @param x value to inspect
 */
export function isBoolean(x: any): x is boolean {
    return x === true || x === false;
}

/**
 * Checks if x is any number type
 * @param x value to inspect
 */
export function isNumber(x: any): x is number {
    return typeof x === "number";
}

/**
 * Checks if x is an int
 * @param x value to inspect
 */
export function isInt(x: any): x is int {
    return Number.isInteger(x);
}

/**
 * Checks if x is an unsigned 32-bit int
 * @param x value to inspect
 */
export function isUInt32(x: any): x is int {
    return x >>> 0 === x;
}

/**
 * Checks if x is an integer between 0 and 255 inclusive.
 * @param x value to inspect
 */
export function isUInt8(x: any): x is byte {
    return Number.isInteger(x) && x >= 0 && x <= 255;
}

/**
 * Checks if x is a bigint
 * @param x value to inspect
 */
export function isBigInt(x: any): x is bigint {
    return typeof x === "bigint";
}

/**
 * Checks if x is a string
 * @param x value to inspect
 */
export function isString(x: any): x is string {
    return typeof x === "string" || x instanceof String;
}

/**
 * Checks if x is an Array
 * Does not check type of individual values.
 * Use isArrayLike for non Array objects but behaves like one
 * @param x value to inspect
 */
export function isArray<T = any>(x: any): x is T[] {
    return x instanceof Array;
}

/**
 * Checks if x is a RegExp
 * @param x value to inspect
 */
export function isRegExp(x: any): x is RegExp {
    return x instanceof RegExp;
}

/**
 * Checks if x is a Function.
 * Passing in an ES6 Class will also return true.
 * @param x value to inspect
 */
export function isFunction<A extends any[], R = any>(x: any): x is (...a: A) => R {
    return x instanceof Function || typeof x === "function";
}

const rxClass = /^class[\s{]/;

/**
 * Checks if x is an ES6 class.
 * DOES NOT WORK IF CLASS WAS TRANSPILED TO ES5 AND BELOW
 * @param x value to inspect
 */
export function isClass<T>(x: any): x is Class<T> {
    if (typeof x !== "function") return false;
    const strFn = Function.prototype.toString.call(x);
    return rxClass.test(strFn);
}

/**
 * Checks if x is an instance of a class or plain object
 * @param x value to inspect
 */
export function isObject<T = object>(x: any): x is T {
    // need to check for null because typeof null is also object
    return x !== null && typeof x === "object";
}

/**
 * Checks if x is a plain object (not an instance of a class)
 * Use this instead of isPlainObject
 * @param x value to inspect
 */
export function isStruct<T>(x: any): x is Struct<T> {
    return isObject(x) && [Object.prototype, null].includes(Object.getPrototypeOf(x));
}

/**
 * Checks if x is a plain object (not an instance of a class)
 * Use this instead of isPlainObject
 * @param x value to inspect
 */
export function isRecord<K extends keyof any, V>(x: any): x is Record<K, V> {
    return isStruct(x);
}

/**
 * Checks if x is a plain object (not an instance of a class)
 * @deprecated use isStruct
 * @param x value to inspect
 */
export function isPlainObject<T>(x: any): x is Struct<T> {
    return isObject(x) && (x as any).__proto__ === Object.prototype;
}

/**
 * Checks if x is an instance of a class (but not a plain object)
 * Use isInstanceOf to check if it is an instance of a specific class.
 * @param x value to inspect
 */
export function isInstance<T = object>(x: any): x is T {
    return isObject(x) && !isStruct(x);
}

/**
 * Checks if x is an Iterable.
 * @param x value to inspect
 */
export function isIterable<T = any>(x: any): x is Iterable<T> {
    return x != null && typeof x[Symbol.iterator] === "function";
}

/**
 * Checks if x has the shape of an Iterator.
 * @param x value to inspect
 */
export function isIterator<T = any>(x: any): x is Iterator<T> {
    return x != null && typeof x.next === "function";
}

/*----------------------------------------------------------------------
    Higher-Order Inspectors
----------------------------------------------------------------------*/

/**
 * T | undefined
 */
export function isOptional<T>(isT: Inspector<T>): Inspector<T | undefined> {
    return isAnyOf(isUndefined, isT);
}

/**
 * T | null
 */
export function isNullable<T>(isT: Inspector<T>): Inspector<T | null> {
    return isAnyOf(isNull, isT);
}

/**
 * Creates an inspector that flips the outcome of another inspector
 * @example
 * isNot(isInteger)(5) // false
 */
export function isNot<T>(isT: Inspector<T>): Inspector<any> {
    // using `any` because it is not possible to do type negation in TypeScript
    return (x: any): x is any => !isT(x);
}

/**
 * Creates an inspector that checks that x is exactly a particular value.
 * @example
 * isExact(5)(x) // x is 5
 */
export function isExact<T>(value: T): Inspector<T> {
    return (x: any): x is T => x === value;
}

/**
 * Creates an inspector that checks that x is exactly a particular value.
 * Typed version of isExact
 */
export function isStringOf<T extends string>(value: T): Inspector<T> {
    return (x: any): x is T => x === value;
}

/**
 * Creates an inspector that checks that x is exactly a particular value.
 * Typed version of isExact
 */
export function isNumberOf<T extends number>(value: T): Inspector<T> {
    return (x: any): x is T => x === value;
}

/**
 * Creates an inspector that checks that x is exactly a particular value.
 * Typed version of isExact
 */
export function isBooleanOf<T extends boolean>(value: T): Inspector<T> {
    return (x: any): x is T => x === value;
}

/**
 * Creates an inspector that checks that x is an instance of a particular class.
 * @example
 * isInstanceOf(Foo)(x) // x is Foo
 */
export function isInstanceOf<T>(type: Class<T>): Inspector<T> {
    return (x: any): x is T => x instanceof (type as any);
}

/**
 * Creates an inspector that checks that x is an Iterable and every value of
 * x is of a particular type
 * As a limitation of run-time type checking, an empty iterable is always true.
 * @example
 * isIterableOf(isString)(x) // x is Iterable<string>
 */
export function isIterableOf<T>(isT: Inspector<T>): Inspector<Iterable<T>> {
    return (x: any): x is Iterable<T> => {
        if (!isIterable(x)) return false;
        if (isT === isNever) return false;
        if (isT === isAny) return true;
        for (const v of x) if (!isT(v)) return false;
        return true;
    };
}

/**
 * Creates an inspector that checks that x is an Array and every value of
 * x is of a particular type
 * @example
 * isArrayOf(isString)(x) // x is string[]
 */
export function isArrayOf<T>(isT: Inspector<T>): Inspector<T[]> {
    return (x: any): x is T[] => {
        return isArray(x) && isIterableOf(isT)(x);
    };
}

/**
 * Creates an inspector that checks that x is an Set and every value of
 * x is of a particular type
 * @example
 * isSetOf(isString)(x) // x is Set<string>
 */
export function isSetOf<T>(isT: Inspector<T>): Inspector<Set<T>> {
    return (x: any): x is Set<T> => {
        return isSet(x) && isIterableOf(isT)(x);
    };
}

/**
 * Creates an inspector that checks that x is a Map and every key and value of
 * x is of a particular type
 * @param isK Inspector for the key type
 * @param isV Inspector for the value type
 * @returns An inspector function that checks if a value is a Map with the specified key and value types
 * @example
 * isMapOf(isString, isNumber)(x) // x is Map<string, number>
 */
export function isMapOf<K, V>(isK: Inspector<K>, isV: Inspector<V>): Inspector<Map<K, V>> {
    return (x: any): x is Map<K, V> => {
        return isMap(x) && isIterableOf(isK)(x.keys()) && isIterableOf(isV)(x.values());
    };
}

/**
 * Creates an inspector that checks that x is a Record object and every key and value of
 * x matches the specified inspector types
 * @param isK Inspector for the key type
 * @param isV Inspector for the value type
 * @returns An inspector function that checks if a value is a Record with the specified key and value types
 * @example
 * isRecordOf(isString, isNumber)(x) // x is Record<string, number>
 */
export function isRecordOf<K extends keyof any, V>(isK: Inspector<K>, isV: Inspector<V>): Inspector<Record<K, V>> {
    return (x: any): x is Record<K, V> => {
        return isRecord(x) && isIterableOf(isTupleOf(isK, isV))(Object.entries(x));
    };
}

/**
 * Creates an inspector that checks that x matches at least 1 of the given inspectors.
 * This is equivalent to the union type.
 * @example
 * isAnyOf(isA, isB, isC)(x) // x is A | B | C
 */
export function isAnyOf<T extends Inspector<any>[]>(...inspectors: T): Inspector<Union<T>> {
    return (x: any): x is Union<T> => {
        return inspectors.some(isT => isT(x));
    };
}

/**
 * Creates an inspector that checks that x matches all of the given inspectors.
 * This is equivalent to the intersection type.
 * @example
 * isAllOf(isA, isB, isC)(x) // x is A & B & C
 */
export function isAllOf<T extends Inspector<any>[]>(...inspectors: T): Inspector<UnionToIntersection<Union<T>>> {
    return (x: any): x is UnionToIntersection<Union<T>> => {
        return inspectors.every(isT => isT(x));
    };
}

/**
 * Creates an inspector that checks that x is an array containing a specific
 * sequence of types.
 * @example
 * isTupleOf(isString, isNumber, isNull)(x) // x is [string, number, null]
 */
export function isTupleOf<T extends Inspector<any>[]>(...inspectors: T): Inspector<Tuple<T>> {
    return (x: any): x is Tuple<T> => {
        if (!isArray(x)) {
            return false;
        }
        for (let i = 0; i < inspectors.length; ++i) {
            if (!inspectors[i](x[i])) {
                return false;
            }
        }
        return true;
    };
}

/**
 * Creates an inspector that checks that x has a certain shape.
 * @example
 * isObjectOf<Foo>(fooShape)(x) // x is Foo
 */
export function isObjectOf<T>(type: Shape<T>): Inspector<T> {
    return (x: any): x is T => {
        if (!isObject<Struct<any>>(x)) return false;
        for (const [key, isV] of Object.entries<Inspector<any>>(type)) {
            if (!isV(x[key])) return false;
        }
        return true;
    };
}

/*----------------------------------------------------------------------
    Built-in Type Inspector
----------------------------------------------------------------------*/

/**
 * Checks if x is an instance of a Date object
 * @param x value to inspect
 * @returns true if x is a Date object
 */
export function isDate(x: any): x is Date {
    return x instanceof Date;
}

/**
 * Checks if x is an instance of a Set object
 * @param x value to inspect
 * @returns true if x is a Set object
 */
export function isSet<T = any>(x: any): x is Set<T> {
    return x instanceof Set;
}

/**
 * Checks if x is an instance of a Map object
 * @param x value to inspect
 * @returns true if x is a Map object
 */
export function isMap<K = any, V = any>(x: any): x is Map<K, V> {
    return x instanceof Map;
}

/**
 * Checks if x is a Promise object
 * @param x value to inspect
 * @returns true if x is a Promise object
 */
export function isPromise<T = any>(x: any): x is Promise<T> {
    return x instanceof Promise;
}

/**
 * Checks if x is an array-like object
 * @param x value to inspect
 * @returns true if x is an Array or has a numeric length property
 */
export function isArrayLike<T = any>(x: any): x is ArrayLike<T> {
    if (!x) return false;
    if (x instanceof Array || Array.isArray(x)) return true;
    if (!Number.isInteger(x.length)) return false;
    return true;
}

/**
 * Checks if x is a Promise-like object
 * @param x value to inspect
 * @returns true if x is a Promise or has a then method
 */
export function isPromiseLike<T = any>(x: any): x is PromiseLike<T> {
    if (!x) return false;
    if (x instanceof Promise) return true;
    if (typeof x.then !== "function") return false;
    return true;
}

/*----------------------------------------------------------------------
    Extended Type Inspector
----------------------------------------------------------------------*/

/**
 * Creates an inspector that checks if a number is within a specific range
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 */
export function isNumberBetween(min: number, max: number): Inspector<number> {
    return (x: any): x is number => isNumber(x) && x >= min && x <= max;
}

/**
 * Checks if x is a non-empty array
 */
export function isNonEmptyArray<T = any>(x: any): x is [T, ...T[]] {
    return isArray(x) && x.length > 0;
}

/**
 * Creates an inspector that checks if x is a non-empty array of a specific type
 */
export function isNonEmptyArrayOf<T>(isT: Inspector<T>): Inspector<[T, ...T[]]> {
    return (x: any): x is [T, ...T[]] => isArrayOf(isT)(x) && x.length > 0;
}

/**
 * Creates an inspector that refines another inspector with additional constraints
 * @param isT Base type inspector
 * @param predicates One or more additional constraints (predicates) that must all be satisfied
 * @returns An inspector that checks if a value matches the base type and satisfies all predicates
 * @example
 * // Single predicate
 * const isPositiveNumber = isRefined(isNumber, (n) => n > 0);
 *
 * // Multiple predicates
 * const isPositiveEvenNumber = isRefined(isNumber,
 *     (n) => n > 0,
 *     (n) => n % 2 === 0
 * );
 *
 * // Complex object validation
 * type User = { age: number, role: string };
 * const isAdmin = isRefined(
 *     isObjectOf<User>({ age: isNumber, role: isString }),
 *     (user) => user.age >= 18,
 *     (user) => user.role === 'admin'
 * );
 */
export function isRefined<T>(isT: Inspector<T>, ...predicates: Predicate<T>[]): Inspector<T> {
    return (x: any): x is T => isT(x) && predicates.every(cond => cond(x));
}

/**
 * Creates an inspector that checks if x contains a partial subset of the specified shape
 * (requires only the properties that are present to match their types)
 * @param type Shape definition to partially match against
 * @returns An inspector for objects that match a partial subset of the specified shape
 * @example
 * // Define a shape for a User
 * type User = { id: string, name: string, email: string };
 * const userShape = { id: isString, name: isString, email: isString };
 *
 * const isPartialUser = isPartialOf(userShape);
 *
 * isPartialUser({ id: "123" }); // true - subset of properties
 * isPartialUser({ name: "John" }); // true - subset of properties
 * isPartialUser({ id: 123 }); // false - wrong type
 */
export function isPartialOf<T>(type: Shape<T>): Inspector<Partial<T>> {
    return (x: any): x is Partial<T> => {
        if (!isObject<Struct<any>>(x)) return false;

        for (const key in x) {
            // If this key is in the shape and has a validator
            if (key in type) {
                const isV = type[key as keyof T];
                if (!isV(x[key])) return false;
            }
        }
        return true;
    };
}
