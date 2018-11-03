import {
	BufferView,
	PrimitiveInt8U
} from '@sage-js/core';
import {ExceptionUnimplemented} from '../../exception/unimplemented';
import {typed} from '../../typed';
import {InstructionBCL} from './class';

/**
 * InstructionBCLPushConstanti24 constructor.
 */
@typed.decorate('InstructionBCLPushConstanti24')
export class InstructionBCLPushConstanti24
extends InstructionBCL {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = 4;

	/**
	 * Opcode name.
	 */
	public static readonly NAME = 'PushConstanti24';

	/**
	 * The opcode.
	 */
	public static readonly OPCODE = new PrimitiveInt8U(0x41);

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 1;

	/**
	 * Argument 0.
	 */
	public static readonly ARG0 = null;

	/**
	 * Argument 0.
	 */
	public arg0 = null;

	/**
	 * Resource constructor.
	 */
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
		r.arg0 = this.arg0;
		return r;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this._readOpcode(view);
		throw new ExceptionUnimplemented('Unknown implementations: int24s');
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.opcode);
		throw new ExceptionUnimplemented('Unknown implementations: int24s');
	}
}
