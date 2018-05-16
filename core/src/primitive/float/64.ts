import {BufferView} from '../../bufferview';
import {typed} from '../../typed';
import {PrimitiveFloat} from './class';

/**
 * Float64 wrapper.
 *
 * @param value Value of the float.
 */
@typed.decorate('PrimitiveFloat64')
export class PrimitiveFloat64 extends PrimitiveFloat {

	/**
	 * Bit size.
	 */
	public static readonly BITS: number = 64;

	/**
	 * Byte size.
	 */
	public static readonly SIZE: number = 8;

	constructor(value = 0) {
		super(value);
	}

	/**
	 * Compare equality.
	 *
	 * @param other Other instance.
	 * @return Comparison result.
	 */
	public eq(other: PrimitiveFloat64) {
		return this.value === other.value;
	}

	/**
	 * Compare non-equality.
	 *
	 * @param other Other instance.
	 * @return Comparison result.
	 */
	public neq(other: PrimitiveFloat64) {
		return this.value !== other.value;
	}

	/**
	 * Compare greater-than.
	 *
	 * @param other Other instance.
	 * @return Comparison result.
	 */
	public gt(other: PrimitiveFloat64) {
		return this.value > other.value;
	}

	/**
	 * Compare greater-than or equal.
	 *
	 * @param other Other instance.
	 * @return Comparison result.
	 */
	public gte(other: PrimitiveFloat64) {
		return this.value >= other.value;
	}

	/**
	 * ReadableNew implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferReadNew(view: BufferView) {
		const Constructor = this.constructor as typeof PrimitiveFloat64;
		return new Constructor(view.readFloat64()) as this;
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeFloat64(this.value);
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
		return view.getReadableNew(new PrimitiveFloat64(), offset, size);
	}

	/**
	 * Read new from buffer.
	 *
	 * @param view The BufferView.
	 * @param size Size read.
	 * @return New instance.
	 */
	public static readBuffer(view: BufferView, size = [0]) {
		return view.readReadableNew(new PrimitiveFloat64(), size);
	}
}
