import {typed} from '../../typed';

import {ASTNodeIdentifier} from './identifier';
import {ASTNodeArguments} from './arguments';
import {ASTNodeComment} from './comment';
import {ASTNode} from './class';

/**
 * ASTNodeBegin constructor.
 */
@typed.decorate('ASTNodeBegin')
export class ASTNodeBegin extends ASTNode {
	/**
	 * Instruction identifier.
	 */
	public identifier = new ASTNodeIdentifier();

	/**
	 * Arguments collection.
	 */
	public arguments = new ASTNodeArguments();

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
