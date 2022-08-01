# is-type-guards

Minimal and composable [type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) (aka: type predicates).

- Mimics the TypeScript type system.
- Composable with any type guard function.
- Concise API designed to be intuitive through auto-completion.

[![build](https://github.com/Shakeskeyboarde/is-type-guards/actions/workflows/build.yml/badge.svg)](https://github.com/Shakeskeyboarde/is-type-guards/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/Shakeskeyboarde/is-type-guards/branch/main/graph/badge.svg?token=E2VYI8XJLB)](https://codecov.io/gh/Shakeskeyboarde/is-type-guards)

## Usage

```ts
import { is } from 'is-type-guards';

// Compose basic type guards into complex types.
const isUser = is.object({
  id: is('string'),
  username: is('string'),
  age: is.union(is('number'), is.undefined),
});

// Infer the Typescript type of the type guard.
type User = is.infer<typeof isUser>;

// Test if an unknown value matches the type.
if (isUser(value)) {
  // value is User shaped.
  const user: User = value;
}
```

## API

There are 9 type guard _factories_. These factories return new type guard functions based on their arguments.

- `is(typeString)` (alias: `is.typeOf`)
  -  Returns a type guard which matches values that produce the given `typeString` when passed to the [`typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#description) operator.
- `is.instanceOf(...constructors)`
  - Returns a type guard which matches instances of any of the given `constructors` using the `instanceof` operator.
- `is.const(...primitives)` (alias: `is.enum`)
  - Returns a type guard which matches any of the given `primitives` using strict equality (`===`).
- `is.record(...typeGuards)` (alias: `is.dict`)
  - Returns a type guard which matches objects, where all property values match any of the given `typeGuards`.
- `is.array(...typeGuards)`
  - Returns a type guard which matches arrays, where all values match any of the given `typeGuards`.
- `is.object(typeGuardMap)` (alias: `is.shape`)
  - Returns a type guard which matches objects, where each property matches the corresponding `typeGuardMap` property (by key).
- `is.tuple(...typeGuards)`
  - Returns a type guard which matches arrays, where each value matches the corresponding `typeGuards` parameter (by index).
- `is.intersection(...typeGuards)`
  - Returns a type guard which matches all of the given `typeGuards`.
- `is.union(...typeGuards)`
  - Returns a type guard which matches any of the given `typeGuards`.

There are also 5 basic type guard functions (not factories).

- `is.null`
  - Matches `null`.
- `is.undefined`
  - Matches `undefined`.
- `is.nullish` (alias: `is.nil`)
  - Matches `null` or `undefined`.
- `is.unknown`
  - Matches anything (typed as `unknown`).
- `is.any`
  - Matches anything (typed as `any`).

## Custom type guards

Custom type guard functions can be composed with this library as long as they guard their _first/only_ parameter.

```ts
// A custom type guard function.
const isFoo = (value: unknown): value is Foo => {
  return value instanceof Foo;
};

const isFooArray = is.array(isFoo);

if (isFooArray(value)) {
  // value is Foo[]
  const fooArray: Foo[] = value;
}
```
