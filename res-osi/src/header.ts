import {
	Structure,
	BufferView,
	PrimitiveInt16U,
	PrimitiveInt32U,
	ExceptionValue
} from '@sage-js/core';
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
	public versionMajor = new PrimitiveInt16U();

	/**
	 * Minor version.
	 */
	public versionMinor = new PrimitiveInt16U();

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
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.versionMajor = this.versionMajor;
		r.versionMinor = this.versionMinor;
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
	 * @param versionMajor Major version.
	 * @param versionMinor Minor version.
	 */
	public initVersion(
		versionMajor: PrimitiveInt16U | null = null,
		versionMinor: PrimitiveInt16U | null = null
	) {
		if (versionMajor) {
			this.versionMajor = versionMajor;
		}
		if (versionMinor) {
			this.versionMinor = versionMinor;
		}
		this.validateVersion();
		this.stringTable = this.stringTable.createNew();
		this.globalTable = this.globalTable.createNew();
		this.functionTable = this.functionTable.createNew();

		const classMemberCountSize = this.classMemberCountSize;
		switch (classMemberCountSize) {
			case 1: {
				this.classTable = new ClassDefinitionTable1();
				break;
			}
			case 2: {
				this.classTable = new ClassDefinitionTable2();
				break;
			}
			default: {
				throw new ExceptionValue(
					`Invalid classMemberCountSize: ${classMemberCountSize}`
				);
			}
		}

		this.symbolTable = this.symbolTable.createNew();
		this.sourceTable = this.sourceTable.createNew();
	}

	/**
	 * Byte size.
	 */
	public get size() {
		let r = this.magic.size;
		r += this.versionMajor.size;
		r += this.versionMinor.size;
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
	 */
	public get magic() {
		return Header.MAGIC;
	}

	/**
	 * Does the file version have a source table.
	 */
	public get hasSourceTable() {
		return this.versionMajor.value === 4;
	}

	/**
	 * Size of the class member counts, 1 if major version of 4, else 2.
	 */
	public get classMemberCountSize() {
		return this.versionMajor.value === 4 ? 1 : 2;
	}

	/**
	 * Check if version is known or throw if not known.
	 */
	public validateVersion() {
		this._validateVersion(this.versionMajor, this.versionMinor);
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
		const versionMajor = view.readReadableNew(this.versionMajor);
		const versionMinor = view.readReadableNew(this.versionMinor);

		// Init new for version.
		this.initVersion(versionMajor, versionMinor);

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
		view.writeWritable(this.versionMajor);
		view.writeWritable(this.versionMinor);

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
	 * Valide version number pair.
	 *
	 * @param versionMajor Major version.
	 * @param versionMinor Minor version.
	 */
	protected _validateVersion(
		versionMajor: PrimitiveInt16U,
		versionMinor: PrimitiveInt16U
	) {
		const major = versionMajor.value;
		const minor = versionMinor.value;
		switch (major) {
			case 4: {
				if (minor === 1) {
					break;
				}
				throw new ExceptionValue(
					`Invalid minor version: ${major}.${minor}`
				);
			}
			case 6: {
				if (minor === 0) {
					break;
				}
				throw new ExceptionValue(
					`Invalid minor version: ${major}.${minor}`
				);
			}
			default: {
				throw new ExceptionValue(
					`Invalid major version: ${major}.${minor}`
				);
			}
		}
	}
}
