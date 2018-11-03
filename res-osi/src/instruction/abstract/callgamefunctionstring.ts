import {
	PrimitiveStringP8N,
	PrimitiveInt8S
} from '@sage-js/core';
import {
	InstructionBCLCallGameFunction
} from '../bcl/callgamefunction';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractCallGameFunctionString constructor.
 */
@typed.decorate('InstructionAbstractCallGameFunctionString')
export class InstructionAbstractCallGameFunctionString
extends InstructionAbstract {
	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLCallGameFunction.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'CallGameFunctionString';

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 3;

	/**
	 * Argument 0.
	 */
	public static ARG0 = PrimitiveStringP8N;

	/**
	 * Argument 1.
	 */
	public static ARG1 = PrimitiveStringP8N;

	/**
	 * Argument 2.
	 */
	public static ARG2 = PrimitiveInt8S;

	/**
	 * Namespace string.
	 */
	public arg0 = new PrimitiveStringP8N();

	/**
	 * Name string.
	 */
	public arg1 = new PrimitiveStringP8N();

	/**
	 * Argument count.
	 */
	public arg2 = new PrimitiveInt8S();

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
		r.arg2 = this.arg2;
		return r;
	}
}
