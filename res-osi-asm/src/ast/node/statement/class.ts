import {typed} from '../../../typed';
import {ASTNode} from '../class';

/**
 * ASTNodeStatement constructor.
 */
@typed.decorate('ASTNodeStatement')
export abstract class ASTNodeStatement extends ASTNode {
	constructor() {
		super();
	}
}
