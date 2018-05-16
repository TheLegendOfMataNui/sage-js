import {
	Structure,
	BufferView,
	PrimitiveStringP8N
} from '@sage-js/core';
import {ClassDefinition} from '../classdefinition/class';
import {IClassDefinitionTableEntry} from '../types';

/**
 * ClassDefinitionTable constructor.
 */
export abstract class ClassDefinitionTable extends Structure {

	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE: number;

	/**
	 * Table entries, class info and name.
	 */
	public entries: IClassDefinitionTableEntry[] = [];

	/**
	 * Constructor for class definition.
	 *
	 * @return Constructor function.
	 */
	public abstract ClassDefinition: new() => ClassDefinition;

	constructor() {
		super();
	}

	/**
	 * Get entry count size.
	 */
	public get entryCountSize() {
		const Constructor = this.constructor as typeof ClassDefinitionTable;
		return Constructor.ENTRY_COUNT_SIZE;
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.entries = this.entries.map(entry => {
			const structure = entry.structure.copy();
			const name = entry.name;
			return {
				structure,
				name
			};
		});
		return r;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		// Size of length marker, plus the size of each entry.
		let r = 2;
		for (const entry of this.entries) {
			r += entry.structure.size + entry.name.size;
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

		const structures: ClassDefinition[] = [];

		for (let i = 0; i < l; i++) {
			const definition = new this.ClassDefinition();
			view.readReadable(definition);
			structures.push(definition);
		}
		for (let i = 0; i < l; i++) {
			const name = PrimitiveStringP8N.readBuffer(view);
			this.entries.push({
				structure: structures[i],
				name
			});
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
			view.writeWritable(entry.structure);
		}
		for (const entry of this.entries) {
			view.writeWritable(entry.name);
		}
	}
}
