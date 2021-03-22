import {typed} from '../../../typed';
import {ASTNodeComment} from '../comment';

import {ASTNodeStatement} from './class';

/**
 * ASTNodeStatementLine constructor.
 */
@typed.decorate('ASTNodeStatementLine')
export class ASTNodeStatementLine extends ASTNodeStatement {
	/**
	 * Line comment.
	 */
	public comment = new ASTNodeComment();

	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @returns Copied instance.
	 */
	public copy() {
		const r = super.copy();
		r.comment = this.comment.copy();
		return r;
	}
}
