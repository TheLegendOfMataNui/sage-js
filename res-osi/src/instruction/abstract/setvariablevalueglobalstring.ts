import {
	PrimitiveStringP8N
} from '@sage-js/core';

import {typed} from '../../typed';
import {
	InstructionBCLSetVariableValue
} from '../bcl/setvariablevalue';

import {InstructionAbstract} from './class';

/**
 * InstructionAbstractSetVariableValueGlobalString constructor.
 */
@typed.decorate('InstructionAbstractSetVariableValueGlobalString')
export class InstructionAbstractSetVariableValueGlobalString extends
	InstructionAbstract {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLSetVariableValue.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'SetVariableValueGlobalString';

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 1;

	/**
	 * Argument 0.
	 */
	public static ARG0 = PrimitiveStringP8N;

	/**
	 * A string.
	 */
	public arg0 = new PrimitiveStringP8N();

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
		return r;
	}
}
