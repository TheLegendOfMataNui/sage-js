// Generated code.

import {
	BufferView,
	PrimitiveInt8U
} from '@sage-js/core';

import {typed} from '../../typed';

import {InstructionBCL} from './class';

/**
 * InstructionBCLSwap constructor.
 */
@typed.decorate('InstructionBCLSwap')
export class InstructionBCLSwap extends
	InstructionBCL {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = 1;

	/**
	 * Opcode name.
	 */
	public static readonly NAME = 'Swap';

	/**
	 * The opcode.
	 */
	public static readonly OPCODE = new PrimitiveInt8U(0x32);

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 0;

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
		return r;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this._readOpcode(view);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.opcode);
	}
}
