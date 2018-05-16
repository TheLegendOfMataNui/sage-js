import {
	BufferView
} from '@sage-js/core';
import {typed} from '../../typed';
import {ExceptionInvalid} from '../../exception/invalid';
import {InstructionAbstractArgType} from '../../types';
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
		throw new ExceptionInvalid('Abstract instruction not readable');
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		throw new ExceptionInvalid('Abstract instruction not writable');
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @return Argument value or null.
	 */
	public argGet(index: number): InstructionAbstractArgType {
		return super.argGet(index) as InstructionAbstractArgType;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @return Argument value or null.
	 */
	public argSet(index: number, value: InstructionAbstractArgType) {
		super.argSet(index, value);
	}
}
typed.decorate('InstructionAbstract')(InstructionAbstract);
