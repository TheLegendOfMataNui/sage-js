import {
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
			this.constructor as typeof ClassDefinitionPropertyTable;
		return Constructor.ENTRY_COUNT_SIZE;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		// Size of length marker, plus the size of each entry.
		let r = this.entryCountSize;
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
}
