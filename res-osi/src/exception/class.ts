import {typed} from '../typed';
import {Exception as CoreException} from '@sage-js/core';

/**
 * Exception constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('Exception')
export class Exception extends CoreException {
	constructor(message: string) {
		super(message);
	}
}
