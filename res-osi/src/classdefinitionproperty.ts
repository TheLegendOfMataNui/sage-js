import {
	Structure,
	BufferView,
	PrimitiveInt16U
} from '@sage-js/core';

/**
 * ClassDefinitionProperty constructor.
 */
export class ClassDefinitionProperty extends Structure {
	/**
	 * Symbol ID.
	 */
	public symbol = new PrimitiveInt16U();

	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @returns Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.symbol = this.symbol;
		return r;
	}

	/**
	 * Byte size.
	 *
	 * @returns Byte size.
	 */
	public get size() {
		return this.symbol.size;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this.symbol = view.readReadableNew(this.symbol);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.symbol);
	}
}
