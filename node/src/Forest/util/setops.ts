/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Union two sets
 *
 * @export
 * @param {Set<any>} a
 * @param {Set<any>} b
 * @returns {Set<any>} the union
 */
export function union(a: Set<any>, b: Set<any>): Set<any> {
    return new Set([...a, ...b,]);
}

/**
 * Intersection of two sets
 *
 * @export
 * @param {Set<any>} a
 * @param {Set<any>} b
 * @returns {Set<any>} the intersection
 */
export function intersect(a: Set<any>, b: Set<any>): Set<any> {
    return new Set(
        [...a,].filter(x => b.has(x)));
}

/**
 * Set difference `a - b` or `a\b`
 * @param a the main set
 * @param b the auxillary set
 * @returns set difference
 */
export function difference(a: Set<any>, b: Set<any>): Set<any> {
    return new Set(
        [...a,].filter(x => !b.has(x)));
}