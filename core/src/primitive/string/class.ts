import {typed} from '../../typed';
import {ExceptionValue} from '../../exception/value';
import {Primitive} from '../class';

/**
 * The base class for string types.
 *
 * @param value Value of the string.
 */
@typed.decorate('PrimitiveString')
export abstract class PrimitiveString extends Primitive {
	/**
	 * String value.
	 */
	public readonly value: string;

	constructor(value = '') {
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
	 * Convert to encoded string.
	 *
	 * @returns Encoded string.
	 */
	public stringEncode() {
		return JSON.stringify(this.value);
	}

	/**
	 * Decode new from string.
	 *
	 * @param str String encoded.
	 * @returns New instancce.
	 */
	public stringDecodeNew(str: string) {
		const Constructor = this.constructor as
			new(value: string) => PrimitiveString;

		// Try to decode JSON.
		let s = '';
		try {
			s = JSON.parse(str);
		}
		catch (err) {
			const msg = err.message || '';
			throw new ExceptionValue(`Cannot decode: ${msg}`);
		}

		// Check the decode type.
		const st = typeof s;
		if (st !== 'string') {
			throw new ExceptionValue(`Unexpected decode type: ${st}`);
		}

		return new Constructor(s) as this;
	}

	/**
	 * Get the float value.
	 *
	 * @returns Float value.
	 */
	public valueOf() {
		return this.value;
	}

	/**
	 * Get the float value as string.
	 *
	 * @returns Float string.
	 */
	public toString() {
		return `${this.value}`;
	}
}
