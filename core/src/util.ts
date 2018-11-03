import {ExceptionValue} from './exception/value';
import {assertIntegerRange} from './assert';

/**
 * Check if a number is NaN.
 * Like isNaN and Number.isNaN but with strict typing.
 *
 * @param value The number to test.
 * @return True if the value is NaN.
 */
export function utilNumberIsNaN(value: number) {
	// NaN is the only thing that is not strictly equal to itself.
	// tslint:disable-next-line: ter-no-self-compare
	return value !== value;
}

/**
 * Cast a number to a string, with an appropriate prefix.
 *
 * @param value Number to cast to a string.
 * @param base Base to case to.
 * @return Number as a string.
 */
export function utilNumberToString(value: number, base = 10) {
	let prefix = '';
	switch (base) {
		case 10: {
			return value.toString();
		}
		case 2: {
			prefix = '0b';
			break;
		}
		case 8: {
			prefix = '0o';
			break;
		}
		case 16: {
			prefix = '0x';
			break;
		}
		default: {
			throw new ExceptionValue(`Invalid number base: ${base}`);
		}
	}
	const neg = value < 0;
	const abs = neg ? -value : value;
	return (neg ? '-' : '') + prefix + abs.toString(base);
}

/**
 * Cast a string to a number, prefix and sign aware.
 *
 * @param value String to cast to a number.
 * @return Number as a string.
 */
export function utilStringToNumber(value: string) {
	let v = 0;
	if (/^[-+]0\D/.test(value)) {
		v = +value.substr(1);
		v = value.charAt(0) === '-' ? -v : v;
	}
	else {
		v = +value;
	}
	if (utilNumberIsNaN(v) && value !== 'NaN') {
		throw new ExceptionValue(`Invalid number value: ${value}`);
	}
	return v;
}

/**
 * Repeat string.
 *
 * @param value The string to repeat.
 * @param count Repeat count.
 * @return Repeated string.
 */
export function utilStringRepeat(value: string, count: number) {
	return value.repeat ?
		value.repeat(count) :
		(new Array(count + 1)).join(value);
}

/**
 * Pad string.
 *
 * @param value The string to repeat.
 * @param width Target width.
 * @param char Padding character.
 * @param left Pad on the left if true, defaults to the right.
 * @return Padded string.
 */
export function utilStringPad(
	value: string,
	width: number,
	char: string,
	left = false
) {
	if (char.length !== 1) {
		const c = JSON.stringify(char);
		throw new ExceptionValue(`Argument char not a single character ${c}`);
	}
	const add = width - value.length;
	if (add > 0) {
		const pad = utilStringRepeat(char, add);
		value = left ? (pad + value) : (value + pad);
	}
	return value;
}

/**
 * Pad string on left.
 *
 * @param value The string to repeat.
 * @param width Target width.
 * @param char Padding character.
 * @return Padded string.
 */
export function utilStringPadLeft(value: string, width: number, char: string) {
	return utilStringPad(value, width, char, true);
}

/**
 * Pad string on right.
 *
 * @param value The string to repeat.
 * @param width Target width.
 * @param char Padding character.
 * @return Padded string.
 */
export function utilStringPadRight(value: string, width: number, char: string) {
	return utilStringPad(value, width, char, false);
}

/**
 * Convert a number to hex string.
 *
 * @param value Number value.
 * @return Hex string.
 */
export function utilNumberToHex(value: number) {
	return value.toString(16).toUpperCase();
}

/**
 * Convert a character code to hex.
 *
 * @param code Character code.
 * @return Hex string.
 */
export function utilCharCodeToHex(code: number) {
	assertIntegerRange(code, 'code', 0, 0xFF);
	return (code < 0x10 ? '0' : '') + code.toString(16).toUpperCase();
}

/**
 * Convert string to hex.
 *
 * @param str String to be encoded.
 * @return Hex string.
 */
export function utilAsciiToHex(str: string, delimiter = '') {
	return str.split('')
		.map(c => utilCharCodeToHex(c.charCodeAt(0)))
		.join(delimiter);
}

/**
 * Normalize the newline characters.
 *
 * @param str String to be normalized.
 * @return Normalized string.
 */
export function utilNormalizeNewlines(str: string) {
	return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Split string into lines.
 *
 * @param str String to be split.
 * @return String array.
 */
export function utilSplitLines(str: string) {
	return utilNormalizeNewlines(str).split('\n');
}
