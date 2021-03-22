import {
	PrimitiveStringP8N
} from '@sage-js/core';

import {typed} from '../../typed';
import {
	InstructionBCLGetMemberValue
} from '../bcl/getmembervalue';

import {InstructionAbstract} from './class';

/**
 * InstructionAbstractGetMemberValueString constructor.
 */
@typed.decorate('InstructionAbstractGetMemberValueString')
export class InstructionAbstractGetMemberValueString extends
	InstructionAbstract {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLGetMemberValue.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'GetMemberValueString';

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
