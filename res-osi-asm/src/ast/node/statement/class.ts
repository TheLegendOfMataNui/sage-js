import {typed} from '../../../typed';
import {ASTNode} from '../class';

/**
 * ASTNodeStatement constructor.
 */
export abstract class ASTNodeStatement extends ASTNode {
	constructor() {
		super();
	}
}
typed.decorate('ASTNodeStatement')(ASTNodeStatement);
