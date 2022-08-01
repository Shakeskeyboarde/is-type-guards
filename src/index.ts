type Primitive = bigint | boolean | number | string | symbol | null | undefined;
type Constructor = new (...args: readonly any[]) => unknown;
type TypeOf = {
  readonly bigint: bigint;
  readonly boolean: boolean;
  readonly function: Function;
  readonly number: number;
  readonly object: object | null;
  readonly string: string;
  readonly symbol: symbol;
  readonly undefined: undefined;
};
type TypeString = keyof TypeOf;
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer V) => any ? V : never;
type Simplify<T> = T extends Record<string, unknown> ? { readonly [P in keyof T]: T[P] } : T;
type SmartPartial<T> = Simplify<
  UnionToIntersection<
    {
      readonly [P in keyof T]: undefined extends T[P] ? { readonly [K in P]?: T[P] } : { readonly [K in P]: T[P] };
    }[keyof T]
  >
>;

type TypeGuard<TType> = (value: unknown) => value is TType;
type TypeGuardMap = Readonly<Record<any, TypeGuard<unknown>>>;
type TypeGuardArray = readonly TypeGuard<unknown>[];
type InferGuardType<TTypeGuard> = TTypeGuard extends TypeGuard<infer TType> ? TType : never;

type TypeOfTypeGuard<TKey> = TypeGuard<TKey extends TypeString ? TypeOf[TKey] : never>;

type InstanceOfTypeGuard<TConstructors> = TypeGuard<
  TConstructors extends readonly (new (...args: readonly any[]) => infer TType)[] ? TType : never
>;

type ConstTypeGuard<TTypes> = TypeGuard<TTypes extends readonly (infer TType)[] ? TType : never>;

type ObjectTypeGuard<TTypeGuards> = TypeGuard<
  TTypeGuards extends TypeGuardMap
    ? SmartPartial<{ readonly [P in keyof TTypeGuards]: InferGuardType<TTypeGuards[P]> }>
    : never
>;

type RecordTypeGuard<TTypeGuards> = TypeGuard<
  TTypeGuards extends readonly TypeGuard<infer TType>[] ? Readonly<Record<any, TType>> : never
>;

type TupleTypeGuard<TTypeGuards> = TypeGuard<
  TTypeGuards extends TypeGuardArray ? { readonly [P in keyof TTypeGuards]: InferGuardType<TTypeGuards[P]> } : never
>;

type ArrayTypeGuard<TTypeGuards> = TypeGuard<
  TTypeGuards extends readonly TypeGuard<infer TType>[] ? readonly TType[] : never
>;

type UnionTypeGuard<TTypeGuards> = TypeGuard<TTypeGuards extends readonly TypeGuard<infer TType>[] ? TType : never>;

type IntersectionTypeGuard<TTypeGuards> = TypeGuard<
  TTypeGuards extends readonly TypeGuard<infer TType>[] ? UnionToIntersection<TType> : never
>;

/**
 * Returns a type guard which matches values that produce the given
 * {@link typeString} when passed to the `typeof` operator.
 *
 * ```ts
 * typeof 1 === 'number'; // true
 * is('number')(1); // true
 * ```
 */
const is = <TTypeString extends TypeString>(typeString: TTypeString): TypeOfTypeGuard<TTypeString> => {
  return (value): value is InferGuardType<TypeOfTypeGuard<TTypeString>> => typeof value === typeString;
};
/**
 * Alias: {@link is}
 */
is.typeOf = <TTypeString extends TypeString>(typeString: TTypeString): TypeOfTypeGuard<TTypeString> => {
  return is(typeString);
};

/**
 * Returns a type guard which matches instances of any of the given
 * {@link constructors}.
 */
is.instanceOf = <TConstructors extends readonly Constructor[]>(
  ...constructors: TConstructors
): InstanceOfTypeGuard<TConstructors> => {
  return (value): value is InferGuardType<InstanceOfTypeGuard<TConstructors>> => {
    return constructors.length === 0 || constructors.some((ctor) => value instanceof ctor);
  };
};

/**
 * Returns a type guard which exactly matches (`===`) any of the given
 * {@link primitives}.
 */
is.const = <TTypes extends readonly [Primitive, ...(readonly Primitive[])]>(
  ...primitives: TTypes
): ConstTypeGuard<TTypes> => {
  return (value): value is InferGuardType<ConstTypeGuard<TTypes>> => {
    return primitives.some((primitive) => primitive === value);
  };
};
/**
 * Alias: {@link is.const}
 */
is.enum = is.const;

/**
 * Returns a type guard which matches objects, where all property values in
 * the object match any of the given {@link typeGuards}.
 */
is.record = <TTypeGuards extends TypeGuardArray>(...typeGuards: TTypeGuards): RecordTypeGuard<TTypeGuards> => {
  return (value: any): value is InferGuardType<RecordTypeGuard<TTypeGuards>> => {
    return (
      value != null &&
      typeof value === 'object' &&
      (typeGuards.length === 0 ||
        (Object.getOwnPropertyNames(value).every((key) => typeGuards.some((guard) => guard(value[key]))) &&
          Object.getOwnPropertySymbols(value).every((key) => typeGuards.some((guard) => guard(value[key])))))
    );
  };
};
/**
 * Alias: {@link is.record}
 */
is.dict = is.record;

/**
 * Returns a type guard which matches arrays, where all values in the array
 * match any of the given {@link typeGuards}.
 */
is.array = <TTypeGuards extends TypeGuardArray>(...typeGuards: TTypeGuards): ArrayTypeGuard<TTypeGuards> => {
  return (value): value is InferGuardType<ArrayTypeGuard<TTypeGuards>> => {
    return (
      Array.isArray(value) &&
      (typeGuards.length === 0 || value.every((entry) => typeGuards.some((guard) => guard(entry))))
    );
  };
};

/**
 * Returns a type guard which matches objects, where each property matches the
 * corresponding {@link typeGuardMap} property (by key).
 */
is.object = <TTypeGuards extends TypeGuardMap>(typeGuardMap: TTypeGuards): ObjectTypeGuard<TTypeGuards> => {
  return (value: any): value is InferGuardType<ObjectTypeGuard<TTypeGuards>> => {
    return (
      value != null &&
      typeof value === 'object' &&
      Object.getOwnPropertyNames(typeGuardMap).every((key) => typeGuardMap[key](value[key])) &&
      Object.getOwnPropertySymbols(typeGuardMap).every((key) => typeGuardMap[key as any](value[key]))
    );
  };
};
/**
 * Alias: {@link is.object}
 */
is.shape = is.object;

/**
 * Returns a type guard which matches arrays, where each value matches the
 * corresponding {@link typeGuards} parameter (by index).
 */
is.tuple = <TTypeGuards extends TypeGuardArray>(...typeGuards: TTypeGuards): TupleTypeGuard<TTypeGuards> => {
  return (value): value is InferGuardType<TupleTypeGuard<TTypeGuards>> => {
    return Array.isArray(value) && typeGuards.every((guard, i) => guard(value[i]));
  };
};

/**
 * Returns a type guard which matches _ALL_ of the given {@link typeGuards}.
 */
is.intersection = <TTypeGuards extends TypeGuardArray>(
  ...typeGuards: TTypeGuards
): IntersectionTypeGuard<TTypeGuards> => {
  return (value): value is InferGuardType<IntersectionTypeGuard<TTypeGuards>> => {
    return typeGuards.every((guard) => guard(value));
  };
};

/**
 * Returns a type guard which matches _ANY_ of the given {@link typeGuards}.
 */
is.union = <TTypeGuards extends TypeGuardArray>(...typeGuards: TTypeGuards): UnionTypeGuard<TTypeGuards> => {
  return (value): value is InferGuardType<UnionTypeGuard<TTypeGuards>> => {
    return typeGuards.length === 0 || typeGuards.some((guard) => guard(value));
  };
};

/**
 * Matches `null`.
 */
is.null = (value: unknown): value is null => {
  return value === null;
};

/**
 * Matches `undefined`.
 */
is.undefined = (value: unknown): value is undefined => {
  return value === undefined;
};

/**
 * Matches `null` or `undefined`.
 */
is.nullish = (value: unknown): value is null | undefined => {
  return value == null;
};
/**
 * Alias: {@link is.nullish}
 */
is.nil = is.nullish;

/**
 * Matches anything (typed as `unknown`).
 */
is.unknown = (value: unknown): value is unknown => {
  return true;
};

/**
 * Matches anything (typed as `any`).
 */
is.any = (value: unknown): value is any => {
  return true;
};

export { type Constructor, type InferGuardType, type Primitive, type TypeGuard, type TypeString as TypeOfString, is };
