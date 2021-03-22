import {
	utilStringRepeat,
	utilStringPadRight
} from '@sage-js/core';

import {typed} from '../typed';
import {ExceptionInternal} from '../exception/internal';
import {ASTNodeIdentifier} from '../ast/node/identifier';
import {ASTNodeArguments} from '../ast/node/arguments';
import {ASTNodeArgument} from '../ast/node/argument/class';
import {ASTNodeComment} from '../ast/node/comment';
import {ASTNodeBegin} from '../ast/node/begin';
import {ASTNodeEnd} from '../ast/node/end';
import {ASTNodeFile} from '../ast/node/file';
import {ASTNodeStatements} from '../ast/node/statements';
import {ASTNodeStatement} from '../ast/node/statement/class';
import {ASTNodeStatementInstruction} from '../ast/node/statement/instruction';
import {ASTNodeStatementBlock} from '../ast/node/statement/block';
import {ASTNodeStatementLine} from '../ast/node/statement/line';

import {Parser} from './class';

/**
 * ParserEncoder constructor.
 */
export class ParserEncoder extends Parser {
	/**
	 * Indent size.
	 */
	public optionIndentSize = 1;

	/**
	 * Indent with tab instead of space.
	 */
	public optionIndentTab = true;

	/**
	 * Align instructions arguments column.
	 */
	public optionInstructionsArgumentsAlign = true;

	/**
	 * Align instructions comments column.
	 */
	public optionInstructionsCommentsAlign = true;

	/**
	 * Stack of instruction alignments.
	 */
	protected _instructionAlignStack: number[][] = [];

	constructor() {
		super();
	}

	/**
	 * Reset any stateful properties.
	 */
	public reset() {
		this._instructionAlignStack = [];
	}

	/**
	 * Get the indent string.
	 *
	 * @returns Indent string.
	 */
	public get indentString() {
		const char = this.optionIndentTab ? '\t' : ' ';
		const size = this.optionIndentSize;
		return size > 1 ? utilStringRepeat(char, size) : char;
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @returns ASM code.
	 */
	public encode(ast: ASTNodeFile) {
		return this.encodeStatements(ast.statements);
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @param depth Indent depth.
	 * @returns ASM code.
	 */
	public encodeStatements(
		ast: ASTNodeStatements,
		depth = 0
	) {
		const alignArguments = this.optionInstructionsArgumentsAlign;
		const alignComments = this.optionInstructionsCommentsAlign;
		let argCol = 0;
		let comCol = 0;

		if (alignArguments || alignComments) {
			let idLenMax = 0;
			let argLenMax = 0;
			let idArgLenMax = 0;

			for (const statement of ast.entries) {
				const instruction = typed.cast(
					statement,
					ASTNodeStatementInstruction
				);
				if (!instruction) {
					continue;
				}

				const id = this.encodeIdentifier(instruction.identifier);
				const args = this.encodeArguments(instruction.arguments);
				const idArgs = this._align(id, args, 0);

				idLenMax = Math.max(idLenMax, id.length);
				argLenMax = Math.max(argLenMax, args.length);
				idArgLenMax = Math.max(idArgLenMax, idArgs.length);
			}

			if (alignArguments && alignComments) {
				argCol = idLenMax + 1;
				comCol = argCol + argLenMax + 1;
			}
			else if (alignArguments) {
				argCol = idLenMax + 1;
			}
			else {
				comCol = idArgLenMax + 1;
			}
		}

		this._instructionAlignStack.push([argCol, comCol]);

		let r = '';
		try {
			r = ast.entries
				.map(e => this.encodeStatement(e, depth))
				.join('');
		}
		finally {
			this._instructionAlignStack.pop();
		}

		return r;
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @param depth Indent depth.
	 * @returns ASM code.
	 */
	public encodeStatement(
		ast: ASTNodeStatement,
		depth = 0
	): string {
		const instruction = typed.cast(ast, ASTNodeStatementInstruction);
		if (instruction) {
			return this.encodeStatementInstruction(instruction, depth);
		}

		const block = typed.cast(ast, ASTNodeStatementBlock);
		if (block) {
			return this.encodeStatementBlock(block, depth);
		}

		const line = typed.cast(ast, ASTNodeStatementLine);
		if (line) {
			return this.encodeStatementLine(line, depth);
		}

		// Should not get here.
		throw new ExceptionInternal('Unhandled statement, type unknown');
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @param depth Indent depth.
	 * @returns ASM code.
	 */
	public encodeStatementInstruction(
		ast: ASTNodeStatementInstruction,
		depth = 0
	) {
		let argCol = 0;
		let comCol = 0;
		const stack = this._instructionAlignStack;
		const stackSize = stack.length;
		if (stackSize) {
			[argCol, comCol] = stack[stackSize - 1];
		}

		let r = this.encodeIdentifier(ast.identifier);

		r = this._align(r, this.encodeArguments(ast.arguments), argCol);

		r = this._align(r, this.encodeComment(ast.comment), comCol);

		return this._line(r, depth);
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @param depth Indent depth.
	 * @returns ASM code.
	 */
	public encodeStatementBlock(
		ast: ASTNodeStatementBlock,
		depth = 0
	) {
		return (
			this.encodeBegin(ast.begin, depth) +
			this.encodeStatements(ast.statements, depth + 1) +
			this.encodeEnd(ast.end, depth)
		);
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @param depth Indent depth.
	 * @returns ASM code.
	 */
	public encodeStatementLine(
		ast: ASTNodeStatementLine,
		depth = 0
	) {
		return this._line(this.encodeComment(ast.comment), depth);
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @param depth Indent depth.
	 * @returns ASM code.
	 */
	public encodeBegin(
		ast: ASTNodeBegin,
		depth = 0
	) {
		let r = `begin ${this.encodeIdentifier(ast.identifier)}`;

		r = this._align(r, this.encodeArguments(ast.arguments), 0);

		r = this._align(r, this.encodeComment(ast.comment), 0);

		return this._line(r, depth);
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @param depth Indent depth.
	 * @returns ASM code.
	 */
	public encodeEnd(
		ast: ASTNodeEnd,
		depth = 0
	) {
		let r = 'end';

		r = this._align(r, this.encodeComment(ast.comment), 0);

		return this._line(r, depth);
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @returns ASM code.
	 */
	public encodeIdentifier(
		ast: ASTNodeIdentifier
	) {
		return ast.text;
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @returns ASM code.
	 */
	public encodeArguments(
		ast: ASTNodeArguments
	) {
		return ast.entries
			.map(e => this.encodeArgument(e))
			.join(', ');
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @returns ASM code.
	 */
	public encodeArgument(
		ast: ASTNodeArgument
	) {
		return ast.text;
	}

	/**
	 * Encode AST to ASM.
	 *
	 * @param ast AST node.
	 * @returns ASM code.
	 */
	public encodeComment(
		ast: ASTNodeComment
	) {
		return ast.text;
	}

	/**
	 * Column align a string.
	 *
	 * @param str String start.
	 * @param add String added.
	 * @param column Column number.
	 * @param empty Set to true to indent even when empty.
	 * @returns Aligned string.
	 */
	protected _align(str: string, add: string, column: number, empty = false) {
		if (!empty && !add) {
			return str;
		}
		if (column < str.length) {
			return `${str} ${add}`;
		}
		return utilStringPadRight(str, column, ' ') + add;
	}

	/**
	 * Indent string, optionally if non-empty.
	 *
	 * @param str String to be indented.
	 * @param depth Indent depth.
	 * @param empty Set to true to indent even when empty.
	 * @returns Indented string.
	 */
	protected _indent(str: string, depth: number, empty = false) {
		if (!empty && !str) {
			return '';
		}
		return utilStringRepeat(this.indentString, depth) + str;
	}

	/**
	 * Create line, optionally indented.
	 *
	 * @param str String to be indented.
	 * @param depth Indent depth.
	 * @returns Indented line.
	 */
	protected _line(str: string, depth = 0) {
		return `${this._indent(str, depth, false)}\n`;
	}
}
