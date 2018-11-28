import {typed} from '../../../typed';
import {utilFormatErrorAtFileLocation} from '../../../util';
import {ASTNode} from '../../../ast/node/class';
import {ExceptionAST} from '../class';

/**
 * ExceptionASTNode constructor.
 *
 * @param message Exception message.
 * @param node Related node.
 */
@typed.decorateException('ExceptionASTNode')
export class ExceptionASTNode extends ExceptionAST {
	/**
	 * Related node.
	 */
	public readonly node: ASTNode;

	constructor(message: string, node: ASTNode) {
		super(utilFormatErrorAtFileLocation(
			message,
			node.source.startLine,
			node.source.startColumn + 1,
			node.source.file.name
		));
		this.node = node;
	}
}
