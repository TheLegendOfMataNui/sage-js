import {
	BufferView,
	Primitive
} from '@sage-js/core';

import {typed} from '../../typed';
import {ExceptionInstruction} from '../../exception/instruction';
import {Instruction} from '../class';

/**
 * InstructionAbstract constructor.
 */
@typed.decorate('InstructionAbstract')
export abstract class InstructionAbstract extends
	Instruction {
	/**
	 * Byte size.
	 */
	public static readonly TYPE = 'abstract';

	/**
	 * Instruction size.
	 */
	public static readonly SIZE: number;

	/**
	 * Argument count.
	 */
	public static readonly ARGC: number;

	/**
	 * Resource constructor.
	 */
	constructor() {
		super();
	}

	/**
	 * Size of the instruction.
	 *
	 * @returns Byte size.
	 */
	public get size() {
		return (this.constructor as typeof InstructionAbstract).SIZE;
	}

	/**
	 * Argument count.
	 *
	 * @returns Argument count.
	 */
	public get argc() {
		return (this.constructor as typeof InstructionAbstract).ARGC;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		throw new ExceptionInstruction(
			'Abstract instruction not readable',
			this
		);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		throw new ExceptionInstruction(
			'Abstract instruction not writable',
			this
		);
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @returns Argument value or null.
	 */
	public argGet(index: number) {
		return super.argGet(index);
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @param value The value.
	 */
	public argSet(index: number, value: Primitive) {
		super.argSet(index, value);
	}
}
