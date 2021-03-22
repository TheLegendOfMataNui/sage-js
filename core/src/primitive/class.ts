import {typed} from '../typed';
import {
	IBufferReadableNew,
	IBufferWriteable
} from '../types';
import {BufferView} from '../bufferview';

/**
 * The base class for primitive types.
 */
@typed.decorate('Primitive')
export abstract class Primitive extends Object implements
IBufferReadableNew, IBufferWriteable {
	constructor() {
		super();
	}

	/**
	 * Byte size.
	 */
	public abstract get size(): number;

	/**
	 * ReadableNew implementation.
	 *
	 * @param view View to read from.
	 */
	public abstract bufferReadNew(view: BufferView): this;

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public abstract bufferWrite(view: BufferView): void;

	/**
	 * Decode new from string.
	 *
	 * @param str String encoded.
	 * @returns New instancce.
	 */
	public abstract stringDecodeNew(str: string): this;

	/**
	 * Convert to encoded string.
	 *
	 * @returns Encoded string.
	 */
	public abstract stringEncode(): string;
}
