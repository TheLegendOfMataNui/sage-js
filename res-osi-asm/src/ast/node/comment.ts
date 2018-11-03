import {typed} from '../../typed';
import {ASTNode} from './class';

/**
 * ASTNodeComment constructor.
 */
@typed.decorate('ASTNodeComment')
export class ASTNodeComment extends ASTNode {
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
