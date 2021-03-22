import {typed} from '../typed';
import {SourceFile} from '../sourcefile';

import {AST} from './class';

/**
 * ASTSource constructor.
 *
 * Lines are 1 indexed while everything else is 0 indexed.
 * This matches most other common AST formats used.
 */
@typed.decorate('ASTSource')
export class ASTSource extends AST {
	/**
	 * Start line, 1 indexed.
	 */
	public startLine = 0;

	/**
	 * Start column, 0 indexed.
	 */
	public startColumn = -1;

	/**
	 * Start index, 0 indexed.
	 */
	public startIndex = -1;

	/**
	 * Stop line, 1 indexed.
	 */
	public stopLine = 0;

	/**
	 * Stop column, 0 indexed.
	 */
	public stopColumn = -1;

	/**
	 * Stop index, 0 indexed.
	 */
	public stopIndex = -1;

	/**
	 * Source file.
	 */
	public file = new SourceFile('');

	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @returns Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.startLine = this.startLine;
		r.startColumn = this.startColumn;
		r.startIndex = this.startIndex;
		r.stopLine = this.stopLine;
		r.stopColumn = this.stopColumn;
		r.stopIndex = this.stopIndex;
		return r;
	}
}
