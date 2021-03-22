import {typed} from '../typed';

import {Exception} from './class';

/**
 * ExceptionRange constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionRange')
export class ExceptionRange extends Exception {
	constructor(message: string) {
		super(message);
	}
}
