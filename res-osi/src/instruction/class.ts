import {
	Structure
} from '@sage-js/core';
import {ExceptionInvalid} from '../exception/invalid';
import {InstructionArgType} from '../types';
import {typed} from '../typed';

/**
 * The base class for Instruction types.
 */
export abstract class Instruction extends Structure {

	/**
	 * Instruction name.
	 */
	public static readonly NAME: string;

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
	 * The name.
	 */
	public get name() {
		return (this.constructor as typeof Instruction).NAME;
	}

	/**
	 * Size of the instruction.
	 */
	public get size() {
		return (this.constructor as typeof Instruction).SIZE;
	}

	/**
	 * Argument count.
	 */
	public get argc() {
		return (this.constructor as typeof Instruction).ARGC;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @return Argument value or null.
	 */
	public argGet(index: number): InstructionArgType {
		const r = (this as any)[`arg${index}`];
		if (!r) {
			throw new ExceptionInvalid(`Invalid argument index: ${index}`);
		}
		return r as InstructionArgType;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @return Argument value or null.
	 */
	public argSet(index: number, value: InstructionArgType) {
		const Type = (this.constructor as any)[`ARG${index}`];
		const cast = typed.cast(value, Type);
		if (!cast) {
			throw new ExceptionInvalid('Invalid type');
		}
		(this as any)[`arg${index}`] = cast;
	}
}
typed.decorate('Instruction')(Instruction);
