import {typed} from '../../../typed';
import {BufferView} from '../../../bufferview';

import {PrimitiveStringP} from './class';

/**
 * The base class for pascal string types.
 *
 * @param value Value of the string.
 */
@typed.decorate('PrimitiveStringP8')
export class PrimitiveStringP8 extends PrimitiveStringP {
	/**
	 * Bit size for length.
	 */
	public static readonly LENGTH_BITS: number = 8;

	/**
	 * Length byte size.
	 */
	public static readonly LENGTH_SIZE: number = 1;

	/**
	 * The max string length.
	 */
	public static readonly LENGTH_MAX: number = 0xFF;

	/**
	 * Null terminated.
	 */
	public static readonly NULL_TERMINATED: boolean = false;

	constructor(value = '') {
		super(value);
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
		return view.getReadableNew(new PrimitiveStringP8(), offset, size);
	}

	/**
	 * Read new from buffer.
	 *
	 * @param view The BufferView.
	 * @param size Size read.
	 * @returns New instance.
	 */
	public static readBuffer(view: BufferView, size = [0]) {
		return view.readReadableNew(new PrimitiveStringP8(), size);
	}
}
