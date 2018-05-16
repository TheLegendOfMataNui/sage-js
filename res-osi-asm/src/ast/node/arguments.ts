import {typed} from '../../typed';
import {ASTNodeArgument} from './argument/class';
import {ASTNode} from './class';

/**
 * ASTNodeArguments constructor.
 */
@typed.decorate('ASTNodeArguments')
export class ASTNodeArguments extends ASTNode {

	/**
	 * Argument list.
	 */
	public entries: ASTNodeArgument[] = [];

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
