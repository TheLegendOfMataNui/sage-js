import {
	Structure,
	BufferView,
	PrimitiveStringP8N
} from '@sage-js/core';

import {ClassDefinition} from '../classdefinition/class';
import {
	IClassDefinitionTableEntry,
	MapClassDefinitionExtends
} from '../types';

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
	 * @returns Constructor function.
	 */
	public abstract ClassDefinition: new() => ClassDefinition;

	constructor() {
		super();
	}

	/**
	 * Get entry count size.
	 *
	 * @returns Size of entry count.
	 */
	public get entryCountSize() {
		const Constructor = this.constructor as typeof ClassDefinitionTable;
		return Constructor.ENTRY_COUNT_SIZE;
	}

	/**
	 * Copy instance.
	 *
	 * @returns Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.entries = this.entries.map(entry => {
			const structure = entry.structure.copy();
			const {name} = entry;
			return {
				structure,
				name
			};
		});
		return r;
	}

	/**
	 * Byte size.
	 *
	 * @returns Byte size.
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

	/**
	 * Transform classes to add extends properties.
	 *
	 * @param map The mappings.
	 */
	public transformClassExtendsAdd(map: MapClassDefinitionExtends) {
		for (const entry of this.entries) {
			const extend = map.get(entry.structure) || null;
			entry.structure.transformClassExtendsAdd(extend);
		}
	}

	/**
	 * Transform classes to remove extends properties.
	 */
	public transformClassExtendsRemove() {
		for (const entry of this.entries) {
			entry.structure.transformClassExtendsRemove();
		}
	}
}
