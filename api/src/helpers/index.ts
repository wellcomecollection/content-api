// The built-in types for `set.has` don't include a type guard
export const isInSet =
  <T, S extends T>(set: ReadonlySet<S>) =>
  (item: T): item is S =>
    set.has(item as S);

export const ifDefined = <T, R>(
  maybeParam: T | undefined,
  func: (param: T) => R
): R | undefined => (maybeParam !== undefined ? func(maybeParam) : undefined);

export const isNotUndefined = <T>(val: T | undefined): val is T =>
  val !== undefined;

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> =>
  Object.fromEntries(
    keys.filter(key => key in obj).map(key => [key, obj[key]])
  ) as Pick<T, K>;

export const not =
  <T extends any[]>( // eslint-disable-line @typescript-eslint/no-explicit-any
    f: (...params: T) => boolean
  ) =>
  (...params: T) =>
    !f(...params);
