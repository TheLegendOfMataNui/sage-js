import {INT32U_MAX, INT32U_MIN} from '../../constants';
import {BufferView} from '../../bufferview';
import {typed} from '../../typed';
import {PrimitiveInt} from './class';

/**
 * Int32U wrapper.
 *
 * @param value Value of the integer.
 */
@typed.decorate('PrimitiveInt32U')
export class PrimitiveInt32U extends PrimitiveInt {
	/**
	 * The maximum allowed value.
	 */
	public static readonly MAX: number = INT32U_MAX;

	/**
	 * The minimum allowed value.
	 */
	public static readonly MIN: number = INT32U_MIN;

	/**
	 * Bit size.
	 */
	public static readonly BITS: number = 32;

	/**
	 * Byte size.
	 */
	public static readonly SIZE: number = 4;

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
	 * @return Comparison result.
	 */
	public eq(other: PrimitiveInt32U) {
		return this.value === other.value;
	}

	/**
	 * Compare non-equality.
	 *
	 * @param other Other instance.
	 * @return Comparison result.
	 */
	public neq(other: PrimitiveInt32U) {
		return this.value !== other.value;
	}

	/**
	 * Compare greater-than.
	 *
	 * @param other Other instance.
	 * @return Comparison result.
	 */
	public gt(other: PrimitiveInt32U) {
		return this.value > other.value;
	}

	/**
	 * Compare greater-than or equal.
	 *
	 * @param other Other instance.
	 * @return Comparison result.
	 */
	public gte(other: PrimitiveInt32U) {
		return this.value >= other.value;
	}

	/**
	 * ReadableNew implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferReadNew(view: BufferView) {
		const Constructor = this.constructor as typeof PrimitiveInt32U;
		return new Constructor(view.readInt32U()) as this;
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeInt32U(this.value);
	}

	/**
	 * Get new from buffer.
	 *
	 * @param view The BufferView.
	 * @param offset Offset to get from.
	 * @param size Size read.
	 * @return New instance.
	 */
	public static getBuffer(view: BufferView, offset = -1, size = [0]) {
		return view.getReadableNew(new PrimitiveInt32U(), offset, size);
	}

	/**
	 * Read new from buffer.
	 *
	 * @param view The BufferView.
	 * @param size Size read.
	 * @return New instance.
	 */
	public static readBuffer(view: BufferView, size = [0]) {
		return view.readReadableNew(new PrimitiveInt32U(), size);
	}
}
