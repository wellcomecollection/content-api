import { ZodError } from 'zod';

import {
  commaSeparatedEnum,
  commaSeparatedPrismicIds,
  dateStringSchema,
  PaginationQuerySchema,
  workIdsSchema,
} from '@weco/content-api/src/controllers/validation';

const parseEnum = commaSeparatedEnum('test', ['a', 'b'] as const, {
  defaultValue: 'a',
});
const parseEnumSingle = commaSeparatedEnum('test', ['a', 'b'] as const, {
  defaultValue: 'a',
  singleValue: true,
});

describe('commaSeparatedEnum', () => {
  it('extracts allowed values from query parameters', () => {
    expect(parseEnum.parse('a')).toStrictEqual(['a']);
    expect(parseEnum.parse('b')).toStrictEqual(['b']);
  });

  it('rejects values which are not in the allowlist', () => {
    expect(() => parseEnum.parse('123')).toThrow(ZodError);
    const err = (() => {
      try {
        parseEnum.parse('123');
      } catch (e) {
        return e as ZodError;
      }
    })()!;
    expect(err.issues[0].message).toBe(
      "test: '123' is not a valid value. Please choose one of 'a' or 'b'"
    );
  });

  it('returns the default value when the input is undefined', () => {
    expect(parseEnum.parse(undefined)).toStrictEqual(['a']);
  });

  it('parses multiple values', () => {
    expect(parseEnum.parse('a,b')).toStrictEqual(['a', 'b']);
  });

  it('rejects multiple values if singleValue is specified', () => {
    expect(() => parseEnumSingle.parse('a,b')).toThrow(ZodError);
    const err = (() => {
      try {
        parseEnumSingle.parse('a,b');
      } catch (e) {
        return e as ZodError;
      }
    })()!;
    expect(err.issues[0].message).toBe(
      'Only 1 value can be specified for test'
    );
  });
});

describe('dateStringSchema', () => {
  it('accepts valid YYYY-MM-DD strings', () => {
    expect(dateStringSchema.parse('2022-02-22')).toBe('2022-02-22');
  });

  it('rejects strings that are not valid dates', () => {
    expect(() => dateStringSchema.parse('A few weeks ago')).toThrow(ZodError);
    const err = (() => {
      try {
        dateStringSchema.parse('A few weeks ago');
      } catch (e) {
        return e as ZodError;
      }
    })()!;
    expect(err.issues[0].message).toBe(
      "'A few weeks ago' is not a valid date. Please use YYYY-MM-DD format."
    );
  });

  it('returns undefined for undefined input', () => {
    expect(dateStringSchema.parse(undefined)).toBeUndefined();
  });

  it('rejects empty string', () => {
    expect(() => dateStringSchema.parse('')).toThrow(ZodError);
  });
});

describe('commaSeparatedPrismicIds', () => {
  const schema = commaSeparatedPrismicIds('formats');

  it('accepts valid Prismic ID strings', () => {
    expect(schema.parse('W7TfJRAAAJ1D0eLK')).toBe('W7TfJRAAAJ1D0eLK');
    expect(schema.parse('W7TfJRAAAJ1D0eLK,W7d_ghAAALWY3Ujc')).toBe(
      'W7TfJRAAAJ1D0eLK,W7d_ghAAALWY3Ujc'
    );
  });

  it('rejects invalid Prismic IDs', () => {
    expect(() => schema.parse('not valid!')).toThrow(ZodError);
  });

  it('rejects empty string', () => {
    expect(() => schema.parse('')).toThrow(ZodError);
  });

  it('returns undefined for undefined input', () => {
    expect(schema.parse(undefined)).toBeUndefined();
  });
});

describe('workIdsSchema', () => {
  it('accepts valid work IDs', () => {
    expect(workIdsSchema.parse('abc123')).toBe('abc123');
  });

  it('rejects invalid work IDs', () => {
    expect(() => workIdsSchema.parse('abc-123!')).toThrow(ZodError);
  });

  it('accepts an array of valid work IDs', () => {
    expect(workIdsSchema.parse(['abc123', 'def456'])).toStrictEqual([
      'abc123',
      'def456',
    ]);
  });

  it('returns undefined for undefined input', () => {
    expect(workIdsSchema.parse(undefined)).toBeUndefined();
  });

  it('rejects empty string', () => {
    expect(() => workIdsSchema.parse('')).toThrow(ZodError);
  });
});

describe('PaginationQuerySchema', () => {
  it('coerces string page/pageSize to numbers', () => {
    expect(PaginationQuerySchema.parse({ page: '2', pageSize: '20' })).toEqual({
      page: 2,
      pageSize: 20,
    });
  });

  it('rejects page < 1', () => {
    expect(() => PaginationQuerySchema.parse({ page: '0' })).toThrow(ZodError);
  });

  it('rejects pageSize > 100', () => {
    expect(() => PaginationQuerySchema.parse({ pageSize: '101' })).toThrow(
      ZodError
    );
  });

  it('returns empty object when no pagination params are provided', () => {
    expect(PaginationQuerySchema.parse({})).toEqual({});
  });
});
