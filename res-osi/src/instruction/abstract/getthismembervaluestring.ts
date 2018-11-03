import {
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	InstructionBCLGetThisMemberValue
} from '../bcl/getthismembervalue';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractGetThisMemberValueString constructor.
 */
@typed.decorate('InstructionAbstractGetThisMemberValueString')
export class InstructionAbstractGetThisMemberValueString
extends InstructionAbstract {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLGetThisMemberValue.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'GetThisMemberValueString';

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
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.arg0 = this.arg0;
		return r;
	}
}
