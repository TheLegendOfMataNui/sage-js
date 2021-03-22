import {
	Structure,
	BufferView,
	PrimitiveInt16U,
	PrimitiveInt32U,
	PrimitiveStringP8
} from '@sage-js/core';

/**
 * FunctionDefinition constructor.
 */
export class FunctionDefinition extends Structure {
	/**
	 * FunctionDefinition name.
	 */
	public name = new PrimitiveStringP8('');

	/**
	 * Bytecode offset.
	 */
	public offset = new PrimitiveInt32U();

	/**
	 * Argument count.
	 */
	public argc = new PrimitiveInt16U();

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
		r.name = this.name;
		r.offset = this.offset;
		r.argc = this.argc;
		return r;
	}

	/**
	 * Byte size.
	 *
	 * @returns Byte size.
	 */
	public get size() {
		return this.name.size + this.offset.size + this.argc.size;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this.name = view.readReadableNew(this.name);
		this.offset = view.readReadableNew(this.offset);
		this.argc = view.readReadableNew(this.argc);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.name);
		view.writeWritable(this.offset);
		view.writeWritable(this.argc);
	}
}
