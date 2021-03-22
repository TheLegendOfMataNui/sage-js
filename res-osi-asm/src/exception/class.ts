import {Exception as CoreException} from '@sage-js/core';

import {typed} from '../typed';

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
