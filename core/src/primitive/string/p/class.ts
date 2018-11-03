import {typed} from '../../../typed';
import {ExceptionValue} from '../../../exception/value';
import {
	assertCstring,
	assertIntegerRange
} from '../../../assert';
import {BufferView} from '../../../bufferview';
import {PrimitiveString} from '../class';

/**
 * The base class for pascal string types.
 *
 * @param value Value of the string.
 */
export abstract class PrimitiveStringP extends PrimitiveString {
	/**
	 * Length bit size.
	 */
	public static readonly LENGTH_BITS: number;

	/**
	 * Length byte size.
	 */
	public static readonly LENGTH_SIZE: number;

	/**
	 * The max string length.
	 */
	public static readonly LENGTH_MAX: number;

	/**
	 * Is it null terminated.
	 */
	public static readonly NULL_TERMINATED: boolean;

	constructor(value = '') {
		assertCstring(value, 'value');
		super(value);
		assertIntegerRange(value.length, 'value.length', 0, this.lengthMax);
	}

	/**
	 * Byte size.
	 */
	public get size() {
		return (
			this.lengthBytes +
			this.value.length +
			(this.nullTerminated ? 1 : 0)
		);
	}

	/**
	 * Length of the value size.
	 */
	public get length() {
		return this.value.length;
	}

	/**
	 * Length bit size.
	 */
	public get lengthBits() {
		return (this.constructor as typeof PrimitiveStringP).LENGTH_BITS;
	}

	/**
	 * Length bit size.
	 */
	public get lengthBytes() {
		return (this.constructor as typeof PrimitiveStringP).LENGTH_SIZE;
	}

	/**
	 * The max string length.
	 */
	public get lengthMax() {
		return (this.constructor as typeof PrimitiveStringP).LENGTH_MAX;
	}

	/**
	 * Is it null terminated.
	 */
	public get nullTerminated() {
		return (this.constructor as typeof PrimitiveStringP).NULL_TERMINATED;
	}

	/**
	 * ReadableNew implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferReadNew(view: BufferView) {
		let l = -1;
		const lb = this.lengthBits;
		switch (lb) {
			case 8: {
				l = view.readInt8U();
				break;
			}
			case 16: {
				l = view.readInt16U();
				break;
			}
			case 32: {
				l = view.readInt32U();
				break;
			}
			default: {
				throw new ExceptionValue(`Invalid length bits size: ${lb}`);
			}
		}

		const chars = [];
		for (let i = 0; i < l; i++) {
			chars.push(view.readInt8U());
		}

		if (this.nullTerminated) {
			const term = view.readInt8U();
			if (term !== 0) {
				throw new ExceptionValue(`String not null terminated: ${term}`);
			}
		}

		const Constructor =
			this.constructor as new(value: string) => PrimitiveStringP;
		return new Constructor(String.fromCharCode(...chars)) as this;
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		const v = this.value;
		const lb = this.lengthBits;
		switch (lb) {
			case 8: {
				view.writeInt8U(v.length);
				break;
			}
			case 16: {
				view.writeInt16U(v.length);
				break;
			}
			case 32: {
				view.writeInt32U(v.length);
				break;
			}
			default: {
				throw new ExceptionValue(`Invalid length bits size: ${lb}`);
			}
		}
		for (let i = 0; i < v.length; i++) {
			view.writeInt8U(v.charCodeAt(i));
		}
		if (this.nullTerminated) {
			view.writeInt8U(0);
		}
	}
}
typed.decorate('PrimitiveStringP')(PrimitiveStringP);
