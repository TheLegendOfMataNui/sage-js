import {INT8U_MAX, INT8U_MIN} from '../../constants';
import {BufferView} from '../../bufferview';
import {typed} from '../../typed';

import {PrimitiveInt} from './class';

/**
 * Int8U wrapper.
 *
 * @param value Value of the integer.
 */
@typed.decorate('PrimitiveInt8U')
export class PrimitiveInt8U extends PrimitiveInt {
	/**
	 * The maximum allowed value.
	 */
	public static readonly MAX: number = INT8U_MAX;

	/**
	 * The minimum allowed value.
	 */
	public static readonly MIN: number = INT8U_MIN;

	/**
	 * Bit size.
	 */
	public static readonly BITS: number = 8;

	/**
	 * Byte size.
	 */
	public static readonly SIZE: number = 1;

	/**
	 * Integer size.
	 */
	public static readonly SIGNED: boolean = true;

	constructor(value = 0) {
		super(value);
	}

	/**
	 * Compare equality.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public eq(other: PrimitiveInt8U) {
		return this.value === other.value;
	}

	/**
	 * Compare non-equality.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public neq(other: PrimitiveInt8U) {
		return this.value !== other.value;
	}

	/**
	 * Compare greater-than.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public gt(other: PrimitiveInt8U) {
		return this.value > other.value;
	}

	/**
	 * Compare greater-than or equal.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public gte(other: PrimitiveInt8U) {
		return this.value >= other.value;
	}

	/**
	 * ReadableNew implementation.
	 *
	 * @param view View to read from.
	 * @returns New value.
	 */
	public bufferReadNew(view: BufferView) {
		const Constructor = this.constructor as typeof PrimitiveInt8U;
		return new Constructor(view.readInt8U()) as this;
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeInt8U(this.value);
	}

	/**
	 * Get new from buffer.
	 *
	 * @param view The BufferView.
	 * @param offset Offset to get from.
	 * @param size Size read.
	 * @returns New instance.
	 */
	public static getBuffer(view: BufferView, offset = -1, size = [0]) {
		return view.getReadableNew(new PrimitiveInt8U(), offset, size);
	}

	/**
	 * Read new from buffer.
	 *
	 * @param view The BufferView.
	 * @param size Size read.
	 * @returns New instance.
	 */
	public static readBuffer(view: BufferView, size = [0]) {
		return view.readReadableNew(new PrimitiveInt8U(), size);
	}
}
