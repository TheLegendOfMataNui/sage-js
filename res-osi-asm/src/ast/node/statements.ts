import {typed} from '../../typed';
import {ASTNodeStatement} from './statement/class';
import {ASTNode} from './class';

/**
 * ASTNodeStatements constructor.
 */
@typed.decorate('ASTNodeStatements')
export class ASTNodeStatements extends ASTNode {

	/**
	 * Child statements.
	 */
	public entries: ASTNodeStatement[] = [];

	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = super.copy();
		r.entries = this.entries.map(e => e.copy());
		return r;
	}
}
