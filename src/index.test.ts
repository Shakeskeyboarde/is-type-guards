import { inspect } from 'node:util';

import { is } from '.';

describe('is', () => {
  const isCases: [Parameters<typeof is>[0], any[], any[]][] = [
    ['string', ['test'], [new Object(''), 1, true, {}]],
    ['number', [1], [new Object(1), 1n, true, {}]],
    ['bigint', [1n], [new Object(1n), 1, true, {}]],
    ['boolean', [true, false], [new Object(true), 1, '', {}]],
    ['symbol', [Symbol()], [new Object(Symbol()), 1, '', {}]],
    ['object', [{}, [], null], [undefined, 1, '']],
    ['function', [() => {}], [1, '', {}]],
    ['undefined', [undefined], [null, 1, '', {}]],
  ];

  isCases.forEach(([type, valid, invalid]) => {
    describe(type, () => {
      valid.forEach((value) => {
        test(inspect(value), () => {
          expect(is(type)(value)).toBe(true);
          expect(is.typeOf(type)(value)).toBe(true);
        });
      });
      invalid.forEach((value) => {
        test(inspect(value), () => {
          expect(is(type)(value)).toBe(false);
          expect(is.typeOf(type)(value)).toBe(false);
        });
      });
    });
  });
});

test('any', () => {
  expect(is.any(1)).toBe(true);
});

test('unknown', () => {
  expect(is.unknown(1)).toBe(true);
});

test('const', () => {
  expect(is.const).toBe(is.enum);
  const isTest = is.const(1, 2);
  expect(isTest(1)).toBe(true);
  expect(isTest(2)).toBe(true);
  expect(isTest(3)).toBe(false);
});

test('array', () => {
  const isTest = is.array(is.const(1), is.const(2));
  expect(isTest([1, 2])).toBe(true);
  expect(isTest([1, 3])).toBe(false);
  expect(isTest([4, 2])).toBe(false);
});

test('instanceOf', () => {
  const isTest = is.instanceOf(RegExp, Date);
  expect(isTest(new Date())).toBe(true);
  expect(isTest(/./)).toBe(true);
  expect(isTest({})).toBe(false);
});

test('object', () => {
  expect(is.object).toBe(is.shape);
  const b = Symbol();
  const isTest = is.object({ a: is('number'), [b]: is('string') });
  expect(isTest({ a: 1, [b]: '' })).toBe(true);
  expect(isTest({ a: 1, [b]: '', c: true })).toBe(true);
  expect(isTest({ a: 1, [b]: 1 })).toBe(false);
  expect(isTest({ a: '', [b]: '' })).toBe(false);
  expect(isTest({ a: 1 })).toBe(false);
  expect(isTest({ [b]: '' })).toBe(false);
});

test('intersection', () => {
  const isTest = is.intersection(is.object({ a: is('number') }), is.object({ b: is('string') }));
  expect(isTest({ a: 1, b: '' })).toBe(true);
  expect(isTest({ a: 1, b: '', c: true })).toBe(true);
  expect(isTest({ a: 1 })).toBe(false);
  expect(isTest({ b: '' })).toBe(false);
  expect(isTest({ a: 1, b: 1 })).toBe(false);
  expect(isTest({ a: '', b: '' })).toBe(false);
});

test('null', () => {
  expect(is.null(null)).toBe(true);
  expect(is.null(undefined)).toBe(false);
  expect(is.null({})).toBe(false);
  expect(is.null(0)).toBe(false);
  expect(is.null([])).toBe(false);
  expect(is.null(false)).toBe(false);
  expect(is.null('')).toBe(false);
});

test('nullish', () => {
  expect(is.nullish).toBe(is.nil);
  expect(is.nullish(null)).toBe(true);
  expect(is.nullish(undefined)).toBe(true);
  expect(is.nullish({})).toBe(false);
  expect(is.nullish(0)).toBe(false);
  expect(is.nullish([])).toBe(false);
  expect(is.nullish(false)).toBe(false);
  expect(is.nullish('')).toBe(false);
});

test('record', () => {
  expect(is.record).toBe(is.dict);
  const isTest = is.record(is.const(1), is.const(2));
  expect(isTest({ a: 1, b: 2 })).toBe(true);
  expect(isTest({ a: 1, b: 3 })).toBe(false);
  expect(isTest({ a: 4, b: 2 })).toBe(false);
});

test('tuple', () => {
  const isTest = is.tuple(is.const(1), is.const(2));
  expect(isTest([1, 2])).toBe(true);
  expect(isTest([1, 2, 3])).toBe(true);
  expect(isTest([2, 1])).toBe(false);
  expect(isTest([1, 3])).toBe(false);
  expect(isTest([4, 2])).toBe(false);
});

test('undefined', () => {
  expect(is.undefined(undefined)).toBe(true);
  expect(is.undefined(null)).toBe(false);
  expect(is.undefined({})).toBe(false);
  expect(is.undefined(0)).toBe(false);
  expect(is.undefined([])).toBe(false);
  expect(is.undefined(false)).toBe(false);
  expect(is.undefined('')).toBe(false);
});

test('union', () => {
  const isTest = is.union(is.object({ a: is('number') }), is.object({ b: is('string') }));
  expect(isTest({ a: 1, b: '' })).toBe(true);
  expect(isTest({ a: 1, b: '', c: true })).toBe(true);
  expect(isTest({ a: 1 })).toBe(true);
  expect(isTest({ b: '' })).toBe(true);
  expect(isTest({ a: 1, b: 1 })).toBe(true);
  expect(isTest({ a: '', b: '' })).toBe(true);
  expect(isTest({ a: '' })).toBe(false);
  expect(isTest({ b: 1 })).toBe(false);
  expect(isTest({ c: true })).toBe(false);
});
