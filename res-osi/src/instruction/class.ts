import {
	Primitive,
	Structure
} from '@sage-js/core';

import {ExceptionInvalid} from '../exception/invalid';
import {typed} from '../typed';

/**
 * The base class for Instruction types.
 */
@typed.decorate('Instruction')
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
	 *
	 * @returns The name.
	 */
	public get name() {
		return (this.constructor as typeof Instruction).NAME;
	}

	/**
	 * Size of the instruction.
	 *
	 * @returns Size of the instruction.
	 */
	public get size() {
		return (this.constructor as typeof Instruction).SIZE;
	}

	/**
	 * Argument count.
	 *
	 * @returns Argument count.
	 */
	public get argc() {
		return (this.constructor as typeof Instruction).ARGC;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @returns Argument value or null.
	 */
	public argGet(index: number): Primitive {
		const r = (this as any)[`arg${index}`];
		if (!r) {
			throw new ExceptionInvalid(`Invalid argument index: ${index}`);
		}
		return r as Primitive;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @param value The value.
	 */
	public argSet(index: number, value: Primitive) {
		const Type = (this.constructor as any)[`ARG${index}`];
		const cast = typed.cast(value, Type);
		if (!cast) {
			throw new ExceptionInvalid('Invalid type');
		}
		(this as any)[`arg${index}`] = cast;
	}
}
