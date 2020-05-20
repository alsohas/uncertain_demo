/* eslint-disable @typescript-eslint/no-explicit-any */
export function union(a: Set<any>, b: Set<any>): Set<any> {
    return new Set([...a, ...b,]);
}

export function intersect(a: Set<any>, b: Set<any>): Set<any> {
    return new Set(
        [...a,].filter(x => b.has(x)));
}

/**
 *
 * @param a the main set
 * @param b the auxillary set
 */
export function difference(a: Set<any>, b: Set<any>): Set<any> {
    return new Set(
        [...a,].filter(x => !b.has(x)));
}