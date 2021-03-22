import {MAX_SAFE_INTEGER, MIN_SAFE_INTEGER} from './constants';
import {ExceptionRange} from './exception/range';
import {ExceptionValue} from './exception/value';

/**
 * Test if string is single line.
 *
 * @param value String to test.
 * @param name Name of value.
 * @param raise Raise or return exceptions.
 * @returns Exception object or null.
 */
export function assertSingleLine(
	value: string,
	name: string,
	raise = true
) {
	let ex = null;
	if (/[\r\n]/.test(value)) {
		const s = JSON.stringify(value);
		ex = new ExceptionValue(`Value not single line: ${name} = ${s}`);
	}
	if (ex && raise) {
		throw ex;
	}
	return ex;
}

/**
 * Test if string is an cstring.
 *
 * @param value String to test.
 * @param name Name of value.
 * @param raise Raise or return exceptions.
 * @returns Exception object or null.
 */
export function assertCstring(
	value: string,
	name: string,
	raise = true
) {
	let ex = null;
	// eslint-disable-next-line no-control-regex
	if (!/^[\x01-\xFF]*$/.test(value)) {
		const s = JSON.stringify(value);
		ex = new ExceptionValue(`Value not a CString: ${name} = ${s}`);
	}
	if (ex && raise) {
		throw ex;
	}
	return ex;
}

/**
 * Test if number is an integer.
 *
 * @param value Value to test.
 * @param name Name of value.
 * @param raise Raise or return exceptions.
 * @returns Exception object or null.
 */
export function assertInteger(
	value: number,
	name: string,
	raise = true
) {
	let ex = null;
	if (!(
		value >= MIN_SAFE_INTEGER &&
		value <= MAX_SAFE_INTEGER &&
		!(value % 1)
	)) {
		ex = new ExceptionValue(`Value must be integer: ${name} = ${value}`);
	}
	if (ex && raise) {
		throw ex;
	}
	return ex;
}

/**
 * Test if number is in range.
 *
 * @param value Value to test.
 * @param name Name of value.
 * @param min Minimunm value.
 * @param max Maximunm value.
 * @param raise Maximunm value.
 * @returns Exception object or null.
 */
export function assertRange(
	value: number,
	name: string,
	min: number,
	max: number,
	raise = true
) {
	let ex = null;
	if (!(
		value >= min &&
		value <= max
	)) {
		const msg = `Value out of range [${min}:${max}]: ${name} = ${value}`;
		ex = new ExceptionRange(msg);
	}
	if (ex && raise) {
		throw ex;
	}
	return ex;
}

/**
 * Test if number is integer and in range.
 *
 * @param value Value to test.
 * @param name Name of value.
 * @param min Minimunm value.
 * @param max Maximunm value.
 * @param raise Maximunm value.
 * @returns Exception object or null.
 */
export function assertIntegerRange(
	value: number,
	name: string,
	min: number,
	max: number,
	raise = true
) {
	const ex =
		assertInteger(value, name, false) ||
		assertRange(value, name, min, max, false);
	if (ex && raise) {
		throw ex;
	}
	return ex;
}
