import {
	ICreateNew,
	ICopyable,
	IBufferReadable,
	IBufferWriteable
} from './types';
import {BufferView} from './bufferview';

/**
 * The base class for structure types.
 */
export abstract class Structure extends Object implements
ICreateNew, ICopyable, IBufferReadable, IBufferWriteable {
	constructor() {
		super();
	}

	/**
	 * Byte size.
	 */
	public abstract get size(): number;

	/**
	 * Create new instance of same type.
	 *
	 * @returns New instance.
	 */
	public createNew() {
		const Constructor = this.constructor as new() => Structure;
		return new Constructor() as this;
	}

	/**
	 * Copy instance.
	 *
	 * @returns Copied instance.
	 */
	public abstract copy(): this;

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public abstract bufferRead(view: BufferView): void;

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public abstract bufferWrite(view: BufferView): void;
}
