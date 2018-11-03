import {typed} from '../../typed';
import {ASTSource} from '../source';
import {AST} from '../class';

/**
 * ASTNode constructor.
 */
export abstract class ASTNode extends AST {
	/**
	 * Location information.
	 */
	public source = new ASTSource();

	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.source = this.source.copy();
		return r;
	}
}
typed.decorate('ASTNode')(ASTNode);
