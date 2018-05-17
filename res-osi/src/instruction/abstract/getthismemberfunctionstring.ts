import {
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	InstructionBCLGetThisMemberFunction
} from '../bcl/getthismemberfunction';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractGetThisMemberFunctionString constructor.
 */
@typed.decorate('InstructionAbstractGetThisMemberFunctionString')
export class InstructionAbstractGetThisMemberFunctionString
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLGetThisMemberFunction.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'GetThisMemberFunctionString';

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
