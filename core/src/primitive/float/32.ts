import {BufferView} from '../../bufferview';
import {typed} from '../../typed';

import {PrimitiveFloat} from './class';

/**
 * Float32 wrapper.
 *
 * @param value Value of the float.
 */
@typed.decorate('PrimitiveFloat32')
export class PrimitiveFloat32 extends PrimitiveFloat {
	/**
	 * Bit size.
	 */
	public static readonly BITS: number = 32;

	/**
	 * Byte size.
	 */
	public static readonly SIZE: number = 4;

	constructor(value = 0) {
		super(value);
	}

	/**
	 * Compare equality.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public eq(other: PrimitiveFloat32) {
		return this.value === other.value;
	}

	/**
	 * Compare non-equality.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public neq(other: PrimitiveFloat32) {
		return this.value !== other.value;
	}

	/**
	 * Compare greater-than.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public gt(other: PrimitiveFloat32) {
		return this.value > other.value;
	}

	/**
	 * Compare greater-than or equal.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public gte(other: PrimitiveFloat32) {
		return this.value >= other.value;
	}

	/**
	 * Compare less-than.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public lt(other: PrimitiveFloat32) {
		return this.value < other.value;
	}

	/**
	 * Compare less-than or equal.
	 *
	 * @param other Other instance.
	 * @returns Comparison result.
	 */
	public lte(other: PrimitiveFloat32) {
		return this.value <= other.value;
	}

	/**
	 * ReadableNew implementation.
	 *
	 * @param view View to read from.
	 * @returns New value.
	 */
	public bufferReadNew(view: BufferView) {
		const Constructor = this.constructor as typeof PrimitiveFloat32;
		return new Constructor(view.readFloat32()) as this;
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeFloat32(this.value);
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
		return view.getReadableNew(new PrimitiveFloat32(), offset, size);
	}

	/**
	 * Read new from buffer.
	 *
	 * @param view The BufferView.
	 * @param size Size read.
	 * @returns New instance.
	 */
	public static readBuffer(view: BufferView, size = [0]) {
		return view.readReadableNew(new PrimitiveFloat32(), size);
	}
}
