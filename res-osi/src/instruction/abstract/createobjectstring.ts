import {
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	InstructionBCLCreateObject
} from '../bcl/createobject';
import {typed} from '../../typed';
import {InstructionAbstract} from './class';

/**
 * InstructionAbstractCreateObjectString constructor.
 */
@typed.decorate('InstructionAbstractCreateObjectString')
export class InstructionAbstractCreateObjectString
extends InstructionAbstract {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = InstructionBCLCreateObject.SIZE;

	/**
	 * Instruction name.
	 */
	public static readonly NAME = 'CreateObjectString';

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
