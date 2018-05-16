import {typed} from '../../../typed';
import {ASTNodeBegin} from '../begin';
import {ASTNodeEnd} from '../end';
import {ASTNodeStatements} from '../statements';
import {ASTNodeStatement} from './class';

/**
 * ASTNodeStatementBlock constructor.
 */
@typed.decorate('ASTNodeStatementBlock')
export class ASTNodeStatementBlock extends ASTNodeStatement {

	/**
	 * Block begin.
	 */
	public begin = new ASTNodeBegin();

	/**
	 * Child nodes.
	 */
	public statements = new ASTNodeStatements();

	/**
	 * Block begin.
	 */
	public end = new ASTNodeEnd();

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
		r.begin = this.begin.copy();
		r.statements = this.statements.copy();
		r.end = this.end.copy();
		return r;
	}
}
