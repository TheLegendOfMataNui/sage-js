import {typed} from '../typed';

import {Exception} from './class';

/**
 * ExceptionSubroutine constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionSubroutine')
export class ExceptionSubroutine extends Exception {
	constructor(message: string) {
		super(message);
	}
}
