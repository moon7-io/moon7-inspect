import { Inspector, isString } from "~/inspect";

/**
 * Creates an inspector that checks if a string matches a specific pattern
 * @param pattern RegExp pattern to match
 */
export function isStringMatching(pattern: RegExp): Inspector<string> {
    return (x: any): x is string => isString(x) && pattern.test(x);
}

// ISO 8601 regex pattern
// This will match: YYYY-MM-DD or YYYY-MM-DDThh:mm:ss or YYYY-MM-DDThh:mm:ss.sssZ
const isoPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(([+-]\d{2}:\d{2})|Z)?)?$/;

/**
 * Checks if string is a valid ISO 8601 date string
 */
export function isISODateString(x: any): x is string {
    return isStringMatching(isoPattern)(x) && !isNaN(Date.parse(x));
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks if string is a valid email address
 */
export function isEmail(x: any): x is string {
    return isStringMatching(emailPattern)(x);
}
