import {typed} from '../typed';
import {Exception} from './class';

/**
 * ExceptionReadonly constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionReadonly')
export class ExceptionReadonly extends Exception {

	constructor(message: string) {
		super(message);
	}
}
