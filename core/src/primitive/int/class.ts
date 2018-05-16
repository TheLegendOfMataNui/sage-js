import {typed} from '../../typed';
import {
	utilNumberToString,
	utilStringToNumber
} from '../../util';
import {assertIntegerRange} from '../../assert';
import {Primitive} from '../class';

/**
 * The base class for integer types.
 *
 * @param value Value of the integer.
 */
export abstract class PrimitiveInt extends Primitive {

	/**
	 * The maximum allowed value.
	 */
	public static readonly MAX: number;

	/**
	 * The minimum allowed value.
	 */
	public static readonly MIN: number;

	/**
	 * Bit size.
	 */
	public static readonly BITS: number;

	/**
	 * Byte size.
	 */
	public static readonly SIZE: number;

	/**
	 * Integer signed.
	 */
	public static readonly SIGNED: boolean;

	/**
	 * Integer value.
	 */
	public readonly value: number;

	constructor(value = 0) {
		super();
		assertIntegerRange(value, 'value', this.min, this.max);
		this.value = value;

		// Make sure value is not modified by mistake.
		Object.defineProperty(this, 'value', {
			configurable: false,
			enumerable: true,
			writable: false,
			value
		});
	}

	/**
	 * The maximum allowed value.
	 */
	public get max() {
		return (this.constructor as typeof PrimitiveInt).MAX;
	}

	/**
	 * The minimum allowed value.
	 */
	public get min() {
		return (this.constructor as typeof PrimitiveInt).MIN;
	}

	/**
	 * Bit size.
	 */
	public get bits() {
		return (this.constructor as typeof PrimitiveInt).BITS;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		return (this.constructor as typeof PrimitiveInt).SIZE;
	}

	/**
	 * Integer signed.
	 */
	public get signed() {
		return (this.constructor as typeof PrimitiveInt).SIGNED;
	}

	/**
	 * Convert to encoded string.
	 *
	 * @param base Encode base.
	 * @return Encoded string.
	 */
	public stringEncode(base = 10) {
		return utilNumberToString(this.value, base);
	}

	/**
	 * Decode new from string.
	 *
	 * @param str String encoded.
	 * @return New instancce.
	 */
	public stringDecodeNew(str: string) {
		const Constructor = this.constructor as
			new(value: number) => PrimitiveInt;
		return new Constructor(utilStringToNumber(str)) as this;
	}

	/**
	 * Get the integer value.
	 *
	 * @return Integer value.
	 */
	public valueOf() {
		return this.value;
	}

	/**
	 * Get the integer value as string.
	 *
	 * @return Integer string.
	 */
	public toString() {
		return `${this.value}`;
	}

	/**
	 * Format for Node console.
	 *
	 * @param depth Inspect depth.
	 * @param opts Inspect options.
	 * @return Formatted string.
	 */
	public inspect(depth: number, opts: NodeJS.InspectOptions) {
		// Avoids default of: { [Number: 42] value: 42 }
		return `${this.constructor.name} { value: ${this.value} }`;
	}
}
typed.decorate('PrimitiveInt')(PrimitiveInt);
