import {
	PrimitiveInt16U,
	Structure,
	BufferView
} from '@sage-js/core';
import {
	IClassDefinitionPropertyFind,
	IClassDefinitionMethodFind
} from '../types';
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
	 * The class this extends, or null.
	 */
	public extends: ClassDefinition | null = null;

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
		r.extends = this.extends;
		r.classPropertyTable = this.classPropertyTable.copy();
		r.classMethodTable = this.classMethodTable.copy();
		return r;
	}

	/**
	 * Get entry count size.
	 */
	public get entryCountSize() {
		const Constructor = this.constructor as typeof ClassDefinition;
		return Constructor.ENTRY_COUNT_SIZE;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		let r = (
			this.classPropertyTable.entryCountSize +
			this.classMethodTable.entryCountSize
		);
		for (const property of this.itterProperties()) {
			r += property.size;
		}
		for (const method of this.itterMethods()) {
			r += method.size;
		}
		return r;
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
		if (this.extends) {
			// Copy and flatten before writing data.
			const copied = this.copy();
			copied.transformClassExtendsRemove();
			view.writeWritable(copied);
		}
		else {
			view.writeWritable(this.classPropertyTable);
			view.writeWritable(this.classMethodTable);
		}
	}

	/**
	 * Itterate ancestors by walking extends chain.
	 *
	 * @param includeThis Include this instance in the itterations.
	 * @return Ancestor itterator.
	 */
	public * itterAncestors(includeThis = false) {
		if (includeThis) {
			yield this;
		}
		let current = this.extends;
		while (current) {
			yield current;
			current = current.extends;
		}
	}

	/**
	 * Itterate ancestors properties by walking extends chain.
	 *
	 * @param self Include this instance in the itterations.
	 * @param overrides Include overridden from parents.
	 * @return Ancestor property itterator.
	 */
	public * itterAncestorsProperties(self = false, overrides = false) {
		const seen = new Set<number>();
		for (const ancestor of this.itterAncestors(self)) {
			for (const entry of ancestor.classPropertyTable.entries) {
				if (overrides) {
					yield entry;
					continue;
				}
				const sv = entry.symbol.value;
				if (seen.has(sv)) {
					continue;
				}
				seen.add(sv);
				yield entry;
			}
		}
	}

	/**
	 * Itterate ancestors methods by walking extends chain.
	 *
	 * @param self Include this instance in the itterations.
	 * @param overrides Include overridden from parents.
	 * @return Ancestor method itterator.
	 */
	public * itterAncestorsMethods(self = false, overrides = false) {
		const seen = new Set<number>();
		for (const ancestor of this.itterAncestors(self)) {
			for (const entry of ancestor.classMethodTable.entries) {
				if (overrides) {
					yield entry;
					continue;
				}
				const sv = entry.symbol.value;
				if (seen.has(sv)) {
					continue;
				}
				seen.add(sv);
				yield entry;
			}
		}
	}

	/**
	 * Itterate properties by itterating ancestors, skipping the overridden.
	 *
	 * @return Property itterator.
	 */
	public * itterProperties() {
		for (const entry of this.itterAncestorsProperties(true)) {
			yield entry;
		}
	}

	/**
	 * Itterate methods by itterating ancestors, skipping the overridden.
	 *
	 * @return Method itterator.
	 */
	public * itterMethods() {
		for (const entry of this.itterAncestorsMethods(true)) {
			yield entry;
		}
	}

	/**
	 * Find the first ancestor with property.
	 *
	 * @param symbol The symbol to find.
	 * @return The index, entry, and class definition.
	 */
	public findProperty(symbol: PrimitiveInt16U): IClassDefinitionPropertyFind {
		const found = this.classPropertyTable.find(symbol);
		if (found) {
			return {
				definition: this,
				index: found.index,
				entry: found.entry
			};
		}
		const extend = this.extends;
		return extend ? extend.findProperty(symbol) : null;
	}

	/**
	 * Find the first ancestor with method.
	 *
	 * @param symbol The symbol to find.
	 * @return The index, entry, and class definition.
	 */
	public findMethod(symbol: PrimitiveInt16U): IClassDefinitionMethodFind {
		const found = this.classMethodTable.find(symbol);
		if (found) {
			return {
				definition: this,
				index: found.index,
				entry: found.entry
			};
		}
		const extend = this.extends;
		return extend ? extend.findMethod(symbol) : null;
	}

	/**
	 * Transform class to add extends property.
	 *
	 * @param map The parent.
	 */
	public transformClassExtendsAdd(extend: ClassDefinition | null) {
		if (extend) {
			// Remove properties also found in parent.
			const properties = this.classPropertyTable.entries;
			for (let i = properties.length; i--;) {
				const prop = properties[i];
				const found = extend.findProperty(prop.symbol);
				if (!found) {
					continue;
				}
				properties.splice(i, 1);
			}

			// Remove methods also found in parent, if same subroutine offset.
			const methods = this.classMethodTable.entries;
			for (let i = methods.length; i--;) {
				const method = methods[i];
				const found = extend.findMethod(method.symbol);
				if (!found) {
					continue;
				}
				if (method.offset.value !== found.entry.offset.value) {
					continue;
				}
				methods.splice(i, 1);
			}
		}
		this.extends = extend;
	}

	/**
	 * Transform class to remove extends property.
	 */
	public transformClassExtendsRemove() {
		const properties = this.classPropertyTable.entries;
		const propertiesSelf = new Set(properties.map(v => v.symbol.value));
		for (const property of this.itterAncestorsProperties()) {
			if (propertiesSelf.has(property.symbol.value)) {
				continue;
			}
			properties.push(property);
		}

		const methods = this.classMethodTable.entries;
		const methodsSelf = new Set(methods.map(v => v.symbol.value));
		for (const method of this.itterAncestorsMethods()) {
			if (methodsSelf.has(method.symbol.value)) {
				continue;
			}
			methods.push(method);
		}

		this.extends = null;
	}
}
