// Generated code.

import {
	BufferView,
	PrimitiveInt16U,
	PrimitiveInt8U
} from '@sage-js/core';

import {typed} from '../../typed';

import {InstructionBCL} from './class';

/**
 * InstructionBCLLineNumber constructor.
 */
@typed.decorate('InstructionBCLLineNumber')
export class InstructionBCLLineNumber extends
	InstructionBCL {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = 5;

	/**
	 * Opcode name.
	 */
	public static readonly NAME = 'LineNumber';

	/**
	 * The opcode.
	 */
	public static readonly OPCODE = new PrimitiveInt8U(0x04);

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 2;

	/**
	 * Argument 0.
	 */
	public static readonly ARG0 = PrimitiveInt16U;

	/**
	 * Argument 1.
	 */
	public static readonly ARG1 = PrimitiveInt16U;

	/**
	 * Argument 0.
	 */
	public arg0 = new PrimitiveInt16U();

	/**
	 * Argument 1.
	 */
	public arg1 = new PrimitiveInt16U();

	/**
	 * Resource constructor.
	 */
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
		r.arg0 = this.arg0;
		r.arg1 = this.arg1;
		return r;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this._readOpcode(view);
		this.arg0 = view.readReadableNew(this.arg0);
		this.arg1 = view.readReadableNew(this.arg1);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.opcode);
		view.writeWritable(this.arg0);
		view.writeWritable(this.arg1);
	}
}
