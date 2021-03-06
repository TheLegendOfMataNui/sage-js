import {
	PrimitiveInt16U,
	Structure,
	BufferView,
	ExceptionValue
} from '@sage-js/core';

import {ClassDefinitionProperty} from '../classdefinitionproperty';

/**
 * ClassDefinitionPropertyTable constructor.
 */
export abstract class ClassDefinitionPropertyTable extends Structure {
	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE: number;

	/**
	 * Property entries.
	 */
	public entries: ClassDefinitionProperty[] = [];

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
		r.entries = this.entries.map(entry => entry.copy());
		return r;
	}

	/**
	 * Get entry count size.
	 *
	 * @returns Size of entry count.
	 */
	public get entryCountSize() {
		const Constructor =
			this.constructor as typeof ClassDefinitionPropertyTable;
		return Constructor.ENTRY_COUNT_SIZE;
	}

	/**
	 * Byte size.
	 *
	 * @returns Byte size.
	 */
	public get size() {
		// Size of length marker, plus the size of each entry.
		return this.entryCountSize + this.sizeContent;
	}

	/**
	 * Byte size of content.
	 *
	 * @returns Byte size of content.
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
			const property = new ClassDefinitionProperty();
			view.readReadable(property);
			this.entries.push(property);
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
	 * @returns The index and entry.
	 */
	public find(symbol: PrimitiveInt16U) {
		const {entries} = this;
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
