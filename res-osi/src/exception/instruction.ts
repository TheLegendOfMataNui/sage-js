import {typed} from '../typed';
import {Exception} from './class';

/**
 * ExceptionInstruction constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionInstruction')
export class ExceptionInstruction extends Exception {

	constructor(message: string) {
		super(message);
	}
}
