import {typed} from '../typed';

/**
 * Exception constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('Exception')
export class Exception extends Error {

	constructor(message: string) {
		super(message);
	}
}
