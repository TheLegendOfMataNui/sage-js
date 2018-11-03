import {typed} from '../../../typed';
import {ASTNodeIdentifier} from '../identifier';
import {ASTNodeArguments} from '../arguments';
import {ASTNodeComment} from '../comment';
import {ASTNodeStatement} from './class';

/**
 * ASTNodeStatementInstruction constructor.
 */
@typed.decorate('ASTNodeStatementInstruction')
export class ASTNodeStatementInstruction extends ASTNodeStatement {
	/**
	 * Instruction identifier.
	 */
	public identifier = new ASTNodeIdentifier();

	/**
	 * Arguments collection.
	 */
	public arguments = new ASTNodeArguments();

	/**
	 * Instruction comment.
	 */
	public comment = new ASTNodeComment();

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
		r.identifier = this.identifier.copy();
		r.arguments = this.arguments.copy();
		r.comment = this.comment.copy();
		return r;
	}
}
