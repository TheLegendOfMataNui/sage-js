import {
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	InstructionBCLPushConstantString
} from '../bcl/pushconstantstring';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractPushConstantStringString constructor.
 */
@typed.decorate('InstructionAbstractPushConstantStringString')
export class InstructionAbstractPushConstantStringString
extends InstructionAbstract {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLPushConstantString.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'PushConstantStringString';

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
