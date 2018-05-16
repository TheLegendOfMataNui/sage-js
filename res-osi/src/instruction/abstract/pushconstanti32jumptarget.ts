import {
	PrimitiveInt32S,
	PrimitiveInt32U
} from '@sage-js/core';
import {
	InstructionBCLPushConstanti32
} from '../bcl/pushconstanti32';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractPushConstanti32JumpTarget constructor.
 */
@typed.decorate('InstructionAbstractPushConstanti32JumpTarget')
export class InstructionAbstractPushConstanti32JumpTarget
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLPushConstanti32.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'PushConstanti32JumpTarget';

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
	public static ARG1 = PrimitiveInt32S;

	/**
	 * A hopefully unique id.
	 */
	public arg0 = new PrimitiveInt32U();

	/**
	 * Optional adjustment.
	 */
	public arg1 = new PrimitiveInt32S();

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
