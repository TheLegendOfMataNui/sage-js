import {
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	InstructionBCLSetGameVariable
} from '../bcl/setgamevariable';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractSetGameVariableString constructor.
 */
@typed.decorate('InstructionAbstractSetGameVariableString')
export class InstructionAbstractSetGameVariableString
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLSetGameVariable.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'SetGameVariableString';

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
	public static ARG1 = PrimitiveStringP8N;

	/**
	 * Namespace string.
	 */
	public arg0 = new PrimitiveStringP8N();

	/**
	 * Name string.
	 */
	public arg1 = new PrimitiveStringP8N();

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
