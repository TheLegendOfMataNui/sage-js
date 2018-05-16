import {
	Structure,
	BufferView
} from '@sage-js/core';
import {
	ClassDefinitionPropertyTable
} from '../classdefinitionpropertytable/class';
import {ClassDefinitionMethodTable} from '../classdefinitionmethodtable/class';

/**
 * ClassDefinition constructor.
 */
export abstract class ClassDefinition extends Structure {

	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE: number;

	/**
	 * ClassDefinition property table.
	 */
	public abstract classPropertyTable: ClassDefinitionPropertyTable;

	/**
	 * ClassDefinition method table.
	 */
	public abstract classMethodTable: ClassDefinitionMethodTable;

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
		r.classPropertyTable = this.classPropertyTable.copy();
		r.classMethodTable = this.classMethodTable.copy();
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
		return this.classPropertyTable.size + this.classMethodTable.size;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this.classPropertyTable = this.classPropertyTable.createNew();
		view.readReadable(this.classPropertyTable);

		this.classMethodTable = this.classMethodTable.createNew();
		view.readReadable(this.classMethodTable);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.classPropertyTable);
		view.writeWritable(this.classMethodTable);
	}
}
