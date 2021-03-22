import {typed} from '../../typed';

import {ASTNodeStatements} from './statements';
import {ASTNode} from './class';

/**
 * ASTNodeFile constructor.
 */
@typed.decorate('ASTNodeFile')
export class ASTNodeFile extends ASTNode {
	/**
	 * Child nodes.
	 */
	public statements = new ASTNodeStatements();

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
		r.statements = this.statements.copy();
		return r;
	}
}
