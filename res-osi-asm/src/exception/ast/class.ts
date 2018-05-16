import {typed} from '../../typed';
import {Exception} from '../class';

/**
 * ExceptionAST constructor.
 *
 * @param message Exception message.
 */
@typed.decorateException('ExceptionAST')
export class ExceptionAST extends Exception {

	constructor(message: string) {
		super(message);
	}
}
