export const identifiedDocuments = (n: number): Array<{ id: string }> =>
  Array.from({ length: n }).map((_, i) => ({ id: `doc-${i + 1}` }));
