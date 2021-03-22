import {typed} from '../typed';

import {Exception} from './class';

/**
 * ExceptionValue constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionValue')
export class ExceptionValue extends Exception {
	constructor(message: string) {
		super(message);
	}
}
