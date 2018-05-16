import {
	Structure,
	BufferView
} from '@sage-js/core';
import {FunctionDefinition} from './functiondefinition';

/**
 * FunctionDefinitionTable constructor.
 */
export class FunctionDefinitionTable extends Structure {

	/**
	 * FunctionDefinition entries.
	 */
	public entries: FunctionDefinition[] = [];

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
		r.entries = this.entries.map(entry => entry.copy());
		return r;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		// Size of length marker, plus the size of each entry.
		let r = 2;
		for (const entry of this.entries) {
			r += entry.size;
		}
		return r;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		const l = view.readInt16U();

		for (let i = 0; i < l; i++) {
			const definition = new FunctionDefinition();
			view.readReadable(definition);
			this.entries.push(definition);
		}
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeInt16U(this.entries.length);

		for (const entry of this.entries) {
			view.writeWritable(entry);
		}
	}
}
