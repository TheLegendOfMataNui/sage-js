import {
	PrimitiveStringP8N,
	PrimitiveInt8S
} from '@sage-js/core';
import {
	InstructionBCLCallGameFunctionFromString
} from '../bcl/callgamefunctionfromstring';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractCallGameFunctionFromStringString constructor.
 */
@typed.decorate('InstructionAbstractCallGameFunctionFromStringString')
export class InstructionAbstractCallGameFunctionFromStringString
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLCallGameFunctionFromString.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'CallGameFunctionFromStringString';

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 2;

	/**
	 * Argument 0.
	 */
	public static ARG0 = PrimitiveStringP8N;

	/**
	 * Argument 1.
	 */
	public static ARG1 = PrimitiveInt8S;

	/**
	 * Namespace string.
	 */
	public arg0 = new PrimitiveStringP8N();

	/**
	 * Argument count.
	 */
	public arg1 = new PrimitiveInt8S();

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
