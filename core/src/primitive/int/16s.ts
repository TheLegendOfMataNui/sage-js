import {INT16S_MAX, INT16S_MIN} from '../../constants';
import {BufferView} from '../../bufferview';
import {typed} from '../../typed';

import {PrimitiveInt} from './class';

/**
 * Int16S wrapper.
 *
 * @param value Value of the integer.
 */
@typed.decorate('PrimitiveInt16S')
export class PrimitiveInt16S extends PrimitiveInt {
	/**
	 * The maximum allowed value.
	 */
	public static readonly MAX: number = INT16S_MAX;

	/**
	 * The minimum allowed value.
	 */
	public static readonly MIN: number = INT16S_MIN;

	/**
	 * Bit size.
	 */
	public static readonly BITS: number = 16;

	/**
	 * Byte size.
	 */
	public static readonly SIZE: number = 2;

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
	public eq(other: PrimitiveInt16S) {
		return this.value === other.value;
	}

	/**
	 * Compare non-equality.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public neq(other: PrimitiveInt16S) {
		return this.value !== other.value;
	}

	/**
	 * Compare greater-than.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public gt(other: PrimitiveInt16S) {
		return this.value > other.value;
	}

	/**
	 * Compare greater-than or equal.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public gte(other: PrimitiveInt16S) {
		return this.value >= other.value;
	}

	/**
	 * ReadableNew implementation.
	 *
	 * @param view View to read from.
	 * @returns New value.
	 */
	public bufferReadNew(view: BufferView) {
		const Constructor = this.constructor as typeof PrimitiveInt16S;
		return new Constructor(view.readInt16S()) as this;
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeInt16S(this.value);
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
		return view.getReadableNew(new PrimitiveInt16S(), offset, size);
	}

	/**
	 * Read new from buffer.
	 *
	 * @param view The BufferView.
	 * @param size Size read.
	 * @returns New instance.
	 */
	public static readBuffer(view: BufferView, size = [0]) {
		return view.readReadableNew(new PrimitiveInt16S(), size);
	}
}
