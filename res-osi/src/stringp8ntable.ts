import {
	Structure,
	BufferView,
	PrimitiveStringP8N
} from '@sage-js/core';

/**
 * StringP8NTable constructor.
 */
export class StringP8NTable extends Structure {

	/**
	 * String entries.
	 */
	public entries: PrimitiveStringP8N[] = [];

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
		r.entries = [...this.entries];
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
		this.entries = [];
		const l = view.readInt16U();
		for (let i = 0; i < l; i++) {
			this.entries.push(PrimitiveStringP8N.readBuffer(view));
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
