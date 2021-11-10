export function deleteItem(haystack: unknown[], needle: unknown): unknown[] {
  return deleteByIndex(haystack, haystack.indexOf(needle));
}

export function deleteByIndex(haystack: unknown[], needle: number): unknown[] {
  if (needle !== -1) {
    haystack.splice(needle, 1);
  }
  return haystack;
}

/**
 * Functions "arguments" object may be transformed to real array for extra manipulations.
 */
export function fromArguments(args: unknown[]): unknown[] {
  return Array.prototype.slice.call(args);
}

export function shallowCopy(array: unknown[]): unknown[] {
  return array.slice(0);
}
