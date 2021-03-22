import {typed} from '../../../typed';
import {ASTNode} from '../class';

/**
 * ASTNodeArgument constructor.
 */
export abstract class ASTNodeArgument extends ASTNode {
	/**
	 * Argument text.
	 */
	public text: string = '';

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
		r.text = this.text;
		return r;
	}
}
typed.decorate('ASTNodeArgument')(ASTNodeArgument);
