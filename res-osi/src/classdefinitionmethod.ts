import {
	Structure,
	BufferView,
	PrimitiveInt16U,
	PrimitiveInt32U
} from '@sage-js/core';

/**
 * ClassDefinitionMethod constructor.
 */
export class ClassDefinitionMethod extends Structure {

	/**
	 * Symbol ID.
	 */
	public symbol = new PrimitiveInt16U();

	/**
	 * Bytecode offset.
	 */
	public offset = new PrimitiveInt32U();

	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.symbol = this.symbol;
		r.offset = this.offset;
		return r;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		return this.symbol.size + this.offset.size;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this.symbol = view.readReadableNew(this.symbol);
		this.offset = view.readReadableNew(this.offset);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.symbol);
		view.writeWritable(this.offset);
	}
}
