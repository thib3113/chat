/**
 * escape a string for regex
 * @param string
 */
export function escapeRegex(string: string): string {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
