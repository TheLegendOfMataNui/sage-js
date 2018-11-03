import {
${importscore}
} from '@sage-js/core';${importother}
import {typed} from '../../typed';
import {InstructionBCL} from './class';

/**
 * InstructionBCL${name} constructor.
 */
@typed.decorate('InstructionBCL${name}')
export class InstructionBCL${name}
extends InstructionBCL {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = ${size};

	/**
	 * Opcode name.
	 */
	public static readonly NAME = '${name}';

	/**
	 * The opcode.
	 */
	public static readonly OPCODE = new PrimitiveInt8U(0x${opcodehex});

	/**
	 * Argument count.
	 */
	public static readonly ARGC = ${argc};
${argsstatic}${args}
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
		const r = this.createNew();${copies}
		return r;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this._readOpcode(view);${reads}
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.opcode);${writes}
	}
}
