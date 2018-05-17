import {
	BufferView,
	Primitive,
	PrimitiveInt8U,
	utilNumberToHex
} from '@sage-js/core';
import {ExceptionInvalid} from '../../exception/invalid';
import {typed} from '../../typed';
import {Instruction} from '../class';

/**
 * InstructionBCL constructor.
 */
export abstract class InstructionBCL
extends Instruction {

	/**
	 * Byte size.
	 */
	public static readonly TYPE = 'bcl';

	/**
	 * The opcode.
	 */
	public static readonly OPCODE: PrimitiveInt8U;

	/**
	 * Resource constructor.
	 */
	constructor() {
		super();
	}

	/**
	 * The opcode.
	 */
	public get opcode() {
		return (this.constructor as typeof InstructionBCL).OPCODE;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @return Argument value or null.
	 */
	public argGet(index: number): Primitive {
		return super.argGet(index) as Primitive;
	}

	/**
	 * Get instruction argument dynamically by index.
	 *
	 * @param index Argument index.
	 * @return Argument value or null.
	 */
	public argSet(index: number, value: Primitive) {
		super.argSet(index, value);
	}

	/**
	 * Read and verify opcode.
	 *
	 * @param data Buffer to read from.
	 */
	protected _readOpcode(data: BufferView) {
		const op = this.opcode.value;
		const opcode = data.readInt8U();
		if (opcode === op) {
			return;
		}
		const opHex = utilNumberToHex(op);
		const opcodeHex = utilNumberToHex(opcode);
		throw new ExceptionInvalid(
			`Opcode not expected 0x${opHex}: 0x0x${opcodeHex}`
		);
	}
}
typed.decorate('InstructionBCL')(InstructionBCL);
