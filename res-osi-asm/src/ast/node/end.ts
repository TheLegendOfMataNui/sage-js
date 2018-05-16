import {typed} from '../../typed';
import {ASTNodeComment} from './comment';
import {ASTNode} from './class';

/**
 * ASTNodeEnd constructor.
 */
@typed.decorate('ASTNodeEnd')
export class ASTNodeEnd extends ASTNode {

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
	 * @return Copied instance.
	 */
	public copy() {
		const r = super.copy();
		r.comment = this.comment.copy();
		return r;
	}
}
