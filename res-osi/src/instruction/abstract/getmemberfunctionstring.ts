import {
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	InstructionBCLGetMemberFunction
} from '../bcl/getmemberfunction';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractGetMemberFunctionString constructor.
 */
@typed.decorate('InstructionAbstractGetMemberFunctionString')
export class InstructionAbstractGetMemberFunctionString
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLGetMemberFunction.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'GetMemberFunctionString';

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
