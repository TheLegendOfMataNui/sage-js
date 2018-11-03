import {typed} from '../typed';
import {Exception} from './class';

/**
 * ExceptionInternal constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionInternal')
export class ExceptionInternal extends Exception {
	constructor(message: string) {
		super(message);
	}
}
