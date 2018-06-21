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
export abstract class InstructionAbstract
extends Instruction {

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
	 */
	public get size() {
		return (this.constructor as typeof InstructionAbstract).SIZE;
	}

	/**
	 * Argument count.
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
	 * @return Argument value or null.
	 */
	public argGet(index: number): Primitive {
		return super.argGet(index) as Primitive;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @return Argument value or null.
	 */
	public argSet(index: number, value: Primitive) {
		super.argSet(index, value);
	}
}
typed.decorate('InstructionAbstract')(InstructionAbstract);
