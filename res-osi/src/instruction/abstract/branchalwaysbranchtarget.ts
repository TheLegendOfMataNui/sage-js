import {
	PrimitiveInt16S,
	PrimitiveInt32U
} from '@sage-js/core';
import {
	InstructionBCLBranchAlways
} from '../bcl/branchalways';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractBranchAlwaysBranchTarget constructor.
 */
@typed.decorate('InstructionAbstractBranchAlwaysBranchTarget')
export class InstructionAbstractBranchAlwaysBranchTarget
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLBranchAlways.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'BranchAlwaysTarget';

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 2;

	/**
	 * Argument 0.
	 */
	public static ARG0 = PrimitiveInt32U;

	/**
	 * Argument 1.
	 */
	public static ARG1 = PrimitiveInt16S;

	/**
	 * A hopefully unique id.
	 */
	public arg0 = new PrimitiveInt32U();

	/**
	 * Optional adjustment.
	 */
	public arg1 = new PrimitiveInt16S();

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
		r.arg1 = this.arg1;
		return r;
	}
}
