import {
	Structure,
	BufferView,
	PrimitiveInt16U,
	PrimitiveInt32U,
	ExceptionValue
} from '@sage-js/core';

import {MapClassDefinitionExtends} from './types';
import {StringP8NTable} from './stringp8ntable';
import {FunctionDefinitionTable} from './functiondefinitiontable';
import {ClassDefinitionTable} from './classdefinitiontable/class';
import {ClassDefinitionTable1} from './classdefinitiontable/1';
import {ClassDefinitionTable2} from './classdefinitiontable/2';

/**
 * Header constructor.
 * Only reads the header, cannot read the assembly body.
 */
export class Header extends Structure {
	/**
	 * File magic.
	 */
	public static readonly MAGIC = new PrimitiveInt32U(0x4F534900);

	/**
	 * Major version.
	 */
	public version = new PrimitiveInt16U();

	/**
	 * Minor version.
	 */
	public flags = new PrimitiveInt16U();

	/**
	 * String table.
	 */
	public stringTable = new StringP8NTable();

	/**
	 * Global table.
	 */
	public globalTable = new StringP8NTable();

	/**
	 * Function table.
	 */
	public functionTable = new FunctionDefinitionTable();

	/**
	 * ClassDefinition table.
	 */
	public classTable: ClassDefinitionTable = new ClassDefinitionTable1();

	/**
	 * Symbol table.
	 */
	public symbolTable = new StringP8NTable();

	/**
	 * Source table.
	 */
	public sourceTable = new StringP8NTable();

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
		r.version = this.version;
		r.flags = this.flags;
		r.stringTable = this.stringTable.copy();
		r.globalTable = this.globalTable.copy();
		r.functionTable = this.functionTable.copy();
		r.classTable = this.classTable.copy();
		r.symbolTable = this.symbolTable.copy();
		r.sourceTable = this.sourceTable.copy();
		return r;
	}

	/**
	 * Init for specified version, or currently set version.
	 *
	 * @param version Major version.
	 * @param flags Minor version.
	 */
	public initVersion(
		version: PrimitiveInt16U | null = null,
		flags: PrimitiveInt16U | null = null
	) {
		if (version) {
			this.version = version;
		}
		if (flags) {
			this.flags = flags;
		}
		this.validateVersion();
		this.stringTable = this.stringTable.createNew();
		this.globalTable = this.globalTable.createNew();
		this.functionTable = this.functionTable.createNew();

		this.classTable = this.newClassDefinitionTable();

		this.symbolTable = this.symbolTable.createNew();
		this.sourceTable = this.sourceTable.createNew();
	}

	/**
	 * Byte size.
	 *
	 * @returns Byte size.
	 */
	public get size() {
		let r = this.magic.size;
		r += this.version.size;
		r += this.flags.size;
		r += this.stringTable.size;
		r += this.globalTable.size;
		r += this.symbolTable.size;
		r += this.functionTable.size;
		r += this.classTable.size;
		if (this.hasSourceTable) {
			r += this.sourceTable.size;
		}
		return r;
	}

	/**
	 * File magic.
	 *
	 * @returns File magic.
	 */
	public get magic() {
		return Header.MAGIC;
	}

	/**
	 * Does the file version have a source table.
	 *
	 * @returns Has a source table.
	 */
	public get hasSourceTable() {
		// eslint-disable-next-line no-bitwise
		return this.flags.value & 1;
	}

	/**
	 * Size of the class member counts, 1 if major version of 4, else 2.
	 *
	 * @returns Size of member count.
	 */
	public get classMemberCountSize() {
		return this.version.value === 4 ? 1 : 2;
	}

	/**
	 * Check if version is known or throw if not known.
	 */
	public validateVersion() {
		this._validateVersion(this.version);
	}

	/**
	 * Create new class definition table based on classMemberCountSize.
	 *
	 * @returns ClassDefinitionTable instance.
	 */
	public newClassDefinitionTable(): ClassDefinitionTable {
		const {classMemberCountSize} = this;
		switch (classMemberCountSize) {
			case 1: {
				return new ClassDefinitionTable1();
			}
			case 2: {
				return new ClassDefinitionTable2();
			}
			default: {
				// Do nothing.
			}
		}
		throw new ExceptionValue(
			`Invalid classMemberCountSize: ${classMemberCountSize}`
		);
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		const magic = view.readView(4);
		magic.endianL = !magic.endianL;
		if (magic.getInt32U() !== this.magic.value) {
			const magixHex = magic.toHex(' ');
			throw new ExceptionValue(`Invalid header magic: ${magixHex}`);
		}

		// Read the version info.
		const version = view.readReadableNew(this.version);
		const flags = view.readReadableNew(this.flags);

		// Init new for version.
		this.initVersion(version, flags);

		// Read tables.
		view.readReadable(this.stringTable);
		view.readReadable(this.globalTable);
		view.readReadable(this.functionTable);
		view.readReadable(this.classTable);
		view.readReadable(this.symbolTable);
		if (this.hasSourceTable) {
			view.readReadable(this.sourceTable);
		}
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		this.validateVersion();

		const magic = view.readView(4);
		magic.endianL = !magic.endianL;
		magic.writeWritable(this.magic);

		// Read the version info.
		view.writeWritable(this.version);
		view.writeWritable(this.flags);

		// Write tables.
		view.writeWritable(this.stringTable);
		view.writeWritable(this.globalTable);
		view.writeWritable(this.functionTable);
		view.writeWritable(this.classTable);
		view.writeWritable(this.symbolTable);
		if (this.hasSourceTable) {
			view.writeWritable(this.sourceTable);
		}
	}

	/**
	 * Transform classes to add extends properties.
	 *
	 * @param map The mappings.
	 */
	public transformClassExtendsAdd(map: MapClassDefinitionExtends) {
		this.classTable.transformClassExtendsAdd(map);
	}

	/**
	 * Transform classes to remove extends properties.
	 */
	public transformClassExtendsRemove() {
		this.classTable.transformClassExtendsRemove();
	}

	/**
	 * Validate format version number.
	 *
	 * @param version Format version.
	 */
	protected _validateVersion(version: PrimitiveInt16U) {
		const {value} = version;
		switch (value) {
			case 4:
			case 6: {
				break;
			}
			default: {
				throw new ExceptionValue(`Invalid format version: ${value}`);
			}
		}
	}
}
