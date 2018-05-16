import {
	PrimitiveInt32U
} from '@sage-js/core';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionBranchTarget constructor.
 */
@typed.decorate('InstructionAbstractBranchTarget')
export class InstructionAbstractBranchTarget
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = 0;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'BranchTarget';

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 1;

	/**
	 * Argument 0.
	 */
	public static ARG0 = PrimitiveInt32U;

	/**
	 * A hopefully unique id.
	 */
	public arg0 = new PrimitiveInt32U();

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
