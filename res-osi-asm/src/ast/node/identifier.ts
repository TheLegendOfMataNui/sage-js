import {typed} from '../../typed';
import {ASTNode} from './class';

/**
 * ASTNodeIdentifier constructor.
 */
@typed.decorate('ASTNodeIdentifier')
export class ASTNodeIdentifier extends ASTNode {
	/**
	 * Comment text.
	 */
	public text: string = '';

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
		r.text = this.text;
		return r;
	}
}
