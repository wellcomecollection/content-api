export const isInArray = <T, A extends T>(
  item: T,
  array: ReadonlyArray<A>
): item is A => array.includes(item as A);

export const ifDefined = <T, R>(
  maybeParam: T | undefined,
  func: (param: T) => R
): R | undefined => (maybeParam !== undefined ? func(maybeParam) : undefined);

export const isNotUndefined = <T>(val: T | undefined): val is T =>
  val !== undefined;
