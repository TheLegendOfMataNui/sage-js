import {typed} from '../../typed';
import {utilStringToNumber} from '../../util';
import {Primitive} from '../class';

/**
 * The base class for float types.
 *
 * @param value Value of the float.
 */
export abstract class PrimitiveFloat extends Primitive {

	/**
	 * Bit size.
	 */
	public static readonly BITS: number;

	/**
	 * Byte size.
	 */
	public static readonly SIZE: number;

	/**
	 * Float value.
	 */
	public readonly value: number;

	constructor(value = 0) {
		super();
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
	 * Bit size.
	 */
	public get bits() {
		return (this.constructor as typeof PrimitiveFloat).BITS;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		return (this.constructor as typeof PrimitiveFloat).SIZE;
	}

	/**
	 * Convert to encoded string.
	 *
	 * @return Encoded string.
	 */
	public stringEncode() {
		return `${this.value}`;
	}

	/**
	 * Decode new from string.
	 *
	 * @param str String encoded.
	 * @return New instancce.
	 */
	public stringDecodeNew(str: string) {
		const Constructor = this.constructor as
			new(value: number) => PrimitiveFloat;
		return new Constructor(utilStringToNumber(str)) as this;
	}

	/**
	 * Get the float value.
	 *
	 * @return Float value.
	 */
	public valueOf() {
		return this.value;
	}

	/**
	 * Get the float value as string.
	 *
	 * @return Float string.
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
typed.decorate('PrimitiveFloat')(PrimitiveFloat);
