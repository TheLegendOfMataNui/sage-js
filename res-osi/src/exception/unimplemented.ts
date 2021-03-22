import {typed} from '../typed';

import {Exception} from './class';

/**
 * ExceptionUnimplemented constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionUnimplemented')
export class ExceptionUnimplemented extends Exception {
	constructor(message: string) {
		super(message);
	}
}
