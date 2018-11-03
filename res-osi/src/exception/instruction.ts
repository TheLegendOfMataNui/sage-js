import {typed} from '../typed';
import {Instruction} from '../instruction/class';
import {Exception} from './class';

/**
 * ExceptionInstruction constructor.
 *
 * @param message Exception message.
 * @param instruction Triggering instruction.
 */
@typed.decorateException('ExceptionInstruction')
export class ExceptionInstruction extends Exception {
	/**
	 * Triggering instruction.
	 */
	public readonly instruction: Instruction;

	constructor(message: string, instruction: Instruction) {
		super(message);
		this.instruction = instruction;
	}
}
