import {
	PrimitiveInt16U,
	Structure,
	BufferView,
	ExceptionValue
} from '@sage-js/core';
import {ClassDefinitionMethod} from '../classdefinitionmethod';

/**
 * ClassDefinitionMethodTable constructor.
 */
export abstract class ClassDefinitionMethodTable extends Structure {
	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE: number;

	/**
	 * Method entries.
	 */
	public entries: ClassDefinitionMethod[] = [];

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
	 * Get entry count size.
	 */
	public get entryCountSize() {
		const Constructor =
			this.constructor as typeof ClassDefinitionMethodTable;
		return Constructor.ENTRY_COUNT_SIZE;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		// Size of length marker, plus the size of each entry.
		return this.entryCountSize + this.sizeContent;
	}

	/**
	 * Byte size of content.
	 */
	public get sizeContent() {
		let r = 0;
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

		let l;
		switch (this.entryCountSize) {
			case 1: {
				l = view.readInt8U();
				break;
			}
			case 2: {
				l = view.readInt16U();
				break;
			}
			default: {
				throw new ExceptionValue(
					`Unexpected entryCountSize value: ${this.entryCountSize}`
				);
			}
		}

		for (let i = 0; i < l; i++) {
			const method = new ClassDefinitionMethod();
			view.readReadable(method);
			this.entries.push(method);
		}
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		switch (this.entryCountSize) {
			case 1: {
				view.writeInt8U(this.entries.length);
				break;
			}
			case 2: {
				view.writeInt16U(this.entries.length);
				break;
			}
			default: {
				throw new ExceptionValue(
					`Unexpected entryCountSize value: ${this.entryCountSize}`
				);
			}
		}

		for (const entry of this.entries) {
			view.writeWritable(entry);
		}
	}

	/**
	 * Find entry.
	 *
	 * @param symbol The symbol to find.
	 * @return The index and entry.
	 */
	public find(symbol: PrimitiveInt16U) {
		const entries = this.entries;
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			if (entry.symbol.value !== symbol.value) {
				continue;
			}
			return {
				index: i,
				entry
			};
		}
		return null;
	}
}
