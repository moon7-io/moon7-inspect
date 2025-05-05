# @moon7/inspect

[![npm version](https://img.shields.io/npm/v/@moon7/inspect.svg)](https://www.npmjs.com/package/@moon7/inspect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, type-safe runtime type checking library for TypeScript and JavaScript.

## Purpose

While it might seem overly simple to use functions like `isString()` or `isNumber()` when you could directly write `typeof x === "string"`, the real power of this library lies in its composability and how it integrates with TypeScript's type system.

### Why Not Just Use typeof?

1. **Composability**: The inspector functions can be combined to create complex type inspectors
   ```typescript
   // Instead of complex nested conditions:
   if (typeof user === 'object' && user !== null && 
       typeof user.name === 'string' && 
       typeof user.age === 'number' && Number.isInteger(user.age)) {
       // ...
   }
   
   // You can create a single, reusable inspector:
   const isUser = isObjectOf({
       name: isString,
       age: isInt,
   });
   
   if (isUser(input)) {
       // TypeScript knows input is a User here
   }
   ```

2. **Type Safety**: TypeScript understands the return types using type predicates
   ```typescript
   function processValue(x: unknown) {
       if (isString(x)) {
           // TypeScript knows x is a string here
           return x.toUpperCase();
       }
       if (isArrayOf(isNumber)(x)) {
           // TypeScript knows x is number[] here
           return x.reduce((a, b) => a + b, 0);
       }
   }
   ```

3. **Consistency**: The same inspection logic can be reused across your application

4. **Extensibility**: Create custom inspectors for your domain-specific types
   ```typescript
   const isPositiveNumber = (x: any): x is number => 
       isNumber(x) && x > 0;
     
   const isEmailAddress = (x: any): x is string => 
       isString(x) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
   ```

5. **Inspection of External Data**: Safely handle data from APIs, user input, or JSON
   ```typescript
   fetch('/api/users')
       .then(response => response.json())
       .then(data => {
           if (isArrayOf(isUser)(data)) {
               // Safe to use data as User[]
           } else {
               throw new Error('API returned unexpected data format');
           }
       });
   ```

The library strikes a balance between simplicity and power, allowing you to build complex inspection logic from simple building blocks while maintaining strong type safety.

## Features

- 🔍 **Type Inspection**: Check if values match expected types at runtime
- 📝 **TypeScript Integration**: Full TypeScript support with accurate type inference
- 🛠️ **Composable API**: Create complex type checkers from simple primitives
- 🍃 **Lightweight**: Zero dependencies, small bundle size
- 🧩 **Flexible**: Works with primitive types, objects, arrays, and custom types

## Installation

```bash
# Using npm
npm install @moon7/inspect

# Using yarn
yarn add @moon7/inspect

# Using pnpm
pnpm add @moon7/inspect
```

## Usage

### What is an Inspector?

An `Inspector<T>` is a function that checks if a value conforms to a specific type `T` at runtime. Every inspector has the signature:

```typescript
type Inspector<T> = (value: any) => value is T;
```

This uses TypeScript's [type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) to provide both:
- Runtime type checking: the function returns `true` or `false` depending on if the value matches the type
- Type narrowing: TypeScript narrows the type when you use the inspector in a conditional

For example, after checking `if (isString(x))`, TypeScript knows that `x` is a `string` within that code block.

### Basic Type Checking

```typescript
import { isString, isNumber, isBoolean, isNull, isUndefined } from '@moon7/inspect';

isString('hello');    // true
isString(42);         // false

isNumber(42);         // true
isNumber('42');       // false

isBoolean(true);      // true
isBoolean('true');    // false

isNull(null);         // true
isUndefined(undefined); // true
```

### Compound Type Checking

```typescript
import { 
    isArray, isArrayOf, isObjectOf, 
    isString, isNumber, isAnyOf, isOptional 
} from '@moon7/inspect';

// Check array of a specific type
const isStringArray = isArrayOf(isString);
isStringArray(['a', 'b', 'c']); // true
isStringArray(['a', 42, 'c']);  // false

// Check object shape
const isPerson = isObjectOf({
    name: isString,
    age: isNumber,
    email: isOptional(isString) // email can be string or undefined
});

isPerson({ name: 'John', age: 30 });                  // true
isPerson({ name: 'John', age: 30, email: 'j@example.com' }); // true
isPerson({ name: 'John', age: '30' });                // false

// Union types
const isStringOrNumber = isAnyOf(isString, isNumber);
isStringOrNumber('hello'); // true
isStringOrNumber(42);      // true
isStringOrNumber(true);    // false
```

### Advanced Features

```typescript
import { 
    isIterableOf, isMapOf, isRecordOf, 
    isTupleOf, isString, isNumber, isBoolean, is 
} from '@moon7/inspect';

// Check tuple with different types
const isUserData = isTupleOf(isString, isNumber, isBoolean);
isUserData(["John", 30, true]);     // true - [name, age, isActive]
isUserData([123, "30", false]);     // false - first item should be string
isUserData(["John", 30]);           // false - missing the boolean

// A more complex example - coordinate with optional label
const isPoint = isTupleOf(isNumber, isNumber, isOptional(isString));
isPoint([10, 20]);          // true - x, y coordinates
isPoint([10, 20, "Home"]);  // true - x, y coordinates with label
isPoint([10, 20, 30]);      // false - third item should be string if present

// Recursive types with is()
const isNestedArray = is(() => isArrayOf(isAnyOf(isNumber, isNestedArray)));
isNestedArray([1, 2, 3]);            // true
isNestedArray([1, [2, 3], 4]);       // true
isNestedArray([1, ['2', 3], 4]);     // false

// Maps and records
const isStringNumberMap = isMapOf(isString, isNumber);
const isStringNumberRecord = isRecordOf(isString, isNumber);
```

### Lazy Evaluation with `is()`

The `is()` function provides lazy evaluation of inspectors, which is crucial in several scenarios:

```typescript
import { is, isObjectOf, isString, isNumber, isArrayOf } from '@moon7/inspect';

// 1. Recursive data structures
// Without lazy evaluation, this would cause a ReferenceError
const isTreeNode = isObjectOf({
    value: isString,
    children: isArrayOf(is(() => isTreeNode)) // Circular reference resolved with is()
});

const validTree = {
    value: "root",
    children: [
        { value: "child1", children: [] },
        { value: "child2", children: [{ value: "grandchild", children: [] }] }
    ]
};

isTreeNode(validTree); // true

// 2. Mutual recursion between types
// These two types reference each other
const isXmlElement = isObjectOf({
    tag: isString,
    attributes: isObjectOf({}),
    children: isArrayOf(is(() => isXmlNode))
});

const isXmlNode = isAnyOf(
    isString, // Text node
    is(() => isXmlElement) // Element node (circular reference)
);

// 3. Breaking dependency cycles between modules
// In module A.ts
export const isTypeA = isObjectOf({
    name: isString,
    relatedB: isOptional(is(() => isTypeB)) // Import from B.ts would create circular dependency
});

// In module B.ts
import { isTypeA } from './A';
export const isTypeB = isObjectOf({
    id: isNumber,
    relatedA: isTypeA
});

// 4. Forward references in the same file
const isPerson = isObjectOf({
    name: isString,
    manager: isOptional(is(() => isPerson)), // Reference to isPerson before full definition
    colleagues: isOptional(isArrayOf(is(() => isPerson)))
});
```

Without `is()`, TypeScript would report reference errors for variables used before being defined.

⚠️ **Caveat**: When using recursive inspectors with `is()`, be careful with deeply nested data structures. Recursive validation can hit JavaScript's call stack limits if the nesting is too deep.

⚠️ **Important**: Even with `is()`, you can still encounter infinite recursion at runtime if the actual data values reference themselves circularly. While `is()` solves the problem of circular type definitions in your code, it cannot automatically detect circular references in the data being validated. For example:

```typescript
// This circular object references itself
const ouroboros: any = { name: "circular" };
ouroboros.self = ouroboros;

// Even with is(), this can cause infinite recursion
const isOuroboros = is(() => {
    return isObjectOf({
        name: isString,
        self: isOuroboros, // Lazy evaluation prevents compile-time issues
    });
});

// But this will still stack overflow at runtime
isOuroboros(ouroboros); // ❌ Maximum call stack size exceeded
```

For validating data with circular references, consider implementing custom inspectors with reference tracking or depth limits.

### Type Inference with Inspected

The `Inspected<T>` utility type allows you to extract TypeScript types from your inspectors, eliminating the need to define types twice:

```typescript
import { isObjectOf, isString, isInt, isBoolean, Inspected } from '@moon7/inspect';

// Define an inspector
const isUser = isObjectOf({
    name: isString,
    age: isInt,
    email: isString,
    isAdmin: isBoolean,
});

// Extract the type from the inspector
export type User = Inspected<typeof isUser>;

/*
    This is equivalent to manually defining:
    type User = {
        name: string;
        age: number;
        email: string;
        isAdmin: boolean;
    }
*/

// Now you can use this type elsewhere in your code
function createUser(userData: User): User {
    // Type checking is applied at compile time
    return userData;
}

// The same inspector can be used for runtime validation
function processUserInput(input: unknown): User {
    if (!isUser(input)) {
        throw new Error('Invalid user data');
    }
    // TypeScript now knows that input is of type User
    return input;
}
```

This pattern ensures that your runtime type checks and compile-time type definitions stay in sync, reducing duplication and potential inconsistencies.

You can also use `Inspected` with other inspector types:

```typescript
const isStringArray = isArrayOf(isString);
type StringArray = Inspected<typeof isStringArray>; // string[]

const isTuple = isTupleOf(isString, isNumber, isBoolean);
type MyTuple = Inspected<typeof isTuple>; // [string, number, boolean]

const isStringOrNumber = isAnyOf(isString, isNumber);
type StringOrNumber = Inspected<typeof isStringOrNumber>; // string | number
```

## API Reference

### Basic Inspectors

- `isAny(x)`: Always returns true
- `isNever(x)`: Always returns false
- `isPrimitive(x)`: Checks if x is null, undefined, number, string, or boolean
- `isUndefined(x)`: Checks if x is undefined
- `isNull(x)`: Checks if x is null
- `isNullish(x)`: Checks if x is null or undefined
- `isBoolean(x)`: Checks if x is a boolean
- `isNumber(x)`: Checks if x is a number
- `isInt(x)`: Checks if x is an integer
- `isString(x)`: Checks if x is a string
- `isArray(x)`: Checks if x is an array
- `isObject(x)`: Checks if x is an object
- `isFunction(x)`: Checks if x is a function
- `isClass(x)`: Checks if x is an ES6 class
- `isStruct(x)`: Checks if x is a plain object (not an instance of a class)
- `isRecord(x)`: Alias for isStruct
- `isInstance(x)`: Checks if x is an instance of a class (but not a plain object)
- `isIterable(x)`: Checks if x is an Iterable
- `isIterator(x)`: Checks if x has the shape of an Iterator
- `isBigInt(x)`: Checks if x is a bigint
- `isUInt32(x)`: Checks if x is an unsigned 32-bit integer
- `isUInt8(x)`: Checks if x is an integer between 0 and 255 inclusive
- `isRegExp(x)`: Checks if x is a RegExp object
- `isPlainObject(x)`: Deprecated, use isStruct instead

### Higher-Order Inspectors

- `isOptional(isT)`: Creates an inspector for `T | undefined`
- `isNullable(isT)`: Creates an inspector for `T | null`
- `isNot(isT)`: Negates an inspector
- `isExact(value)`: Checks if x is exactly a particular value
- `isStringOf(value)`: Typed version of isExact for string literals
- `isNumberOf(value)`: Typed version of isExact for number literals
- `isBooleanOf(value)`: Typed version of isExact for boolean literals
- `isInstanceOf(Class)`: Checks if x is an instance of a specific class
- `isArrayOf(isT)`: Checks if x is an array where every element matches isT
- `isIterableOf(isT)`: Checks if x is an Iterable where every value matches isT
- `isSetOf(isT)`: Checks if x is a Set where every element matches isT
- `isMapOf(isK, isV)`: Checks if x is a Map with specific key and value types
- `isRecordOf(isK, isV)`: Checks if x is a Record with specific key and value types
- `isAnyOf(...inspectors)`: Union type checking (x is A | B | C)
- `isAllOf(...inspectors)`: Intersection type checking (x is A & B & C)
- `isTupleOf(...inspectors)`: Checks if x is an array with a specific sequence of types
- `isObjectOf(shape)`: Checks if x has a certain object shape
- `is(lazy)`: Lazy inspector for circular references

### Builtins Type Inspectors

- `isDate(x)`: Checks if x is a Date object
- `isSet(x)`: Checks if x is a Set
- `isMap(x)`: Checks if x is a Map
- `isPromise(x)`: Checks if x is a Promise
- `isArrayLike(x)`: Checks if x is array-like
- `isPromiseLike(x)`: Checks if x is promise-like

### Extended Type Inspectors

- `isNumberInRange(min, max)`: Checks if a number is within a specific range (inclusive)
- `isNonEmptyArray(x)`: Checks if x is a non-empty array
- `isNonEmptyArrayOf(isT)`: Checks if x is a non-empty array where every element matches isT
- `isPartialOf(type)`: Creates an inspector that checks if x contains a partial subset of the specified shape
- `isRefined(isT, ...predicates)`: Creates an inspector that refines another inspector with additional constraints

### String Inspectors

- `isStringMatching(pattern)`: Checks if a string matches a specific RegExp pattern
- `isISODateString(x)`: Checks if string is a valid ISO 8601 date string
- `isEmail(x)`: Checks if string is a valid email address

## When to Use This Library

- Validating external API responses
- Checking user input data
- Runtime type checking when TypeScript's static type checking isn't enough
- Defensive programming when working with dynamic data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related Libraries

- **@moon7/inspect**: Type inspection with `Inspector<T> = (x: any) => x is T`
- **@moon7/validate**: Type validation with `Validator<T> = (x: T) => void`
- **@moon7/async**: Asynchronous utilities for JavaScript and TypeScript

## License

MIT © Munir Hussin