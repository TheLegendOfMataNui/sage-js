import {typed} from '../typed';
import {Exception} from './class';

/**
 * ExceptionInvalid constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionInvalid')
export class ExceptionInvalid extends Exception {

	constructor(message: string) {
		super(message);
	}
}
