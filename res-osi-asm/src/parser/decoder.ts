// tslint:disable: max-classes-per-file

import {
	CharStreams,
	CommonTokenStream,
	Token
} from 'antlr4ts';

import {ASMLexer} from '../antlr/ASMLexer';
import {
	ASMParser,
	FileContext,
	StatementsContext,
	StatementContext,
	InstructionContext,
	BlockContext,
	LineContext,
	ArgumentsContext,
	ArgumentContext,
	ArgumentNumberContext,
	ArgumentStringContext
} from '../antlr/ASMParser';
import {ASMListener} from '../antlr/ASMListener';

import {SourceFile} from '../sourcefile';
import {ASTNode} from '../ast/node/class';
import {ASTNodeFile} from '../ast/node/file';
import {ASTNodeStatements} from '../ast/node/statements';
import {ASTNodeStatement} from '../ast/node/statement/class';
import {ASTNodeStatementInstruction} from '../ast/node/statement/instruction';
import {ASTNodeStatementBlock} from '../ast/node/statement/block';
import {ASTNodeStatementLine} from '../ast/node/statement/line';
import {ASTNodeArgument} from '../ast/node/argument/class';
import {ASTNodeArgumentString} from '../ast/node/argument/string';
import {ASTNodeArgumentNumber} from '../ast/node/argument/number';
import {ASTNodeArguments} from '../ast/node/arguments';

import {ExceptionInternal} from '../exception/internal';
import {ExceptionSyntax} from '../exception/syntax';
import {Parser} from './class';

/**
 * Copy position from context to an AST node.
 *
 * @param file Source file.
 * @param ast AST node.
 * @param ctx Antlr context.
 */
function copySourceData(file: SourceFile, ast: ASTNode, ctx: {
	/**
	 * Start token.
	 */
	start: Token;

	/**
	 * Stop token.
	 */
	stop?: Token;
}) {
	const src = ast.source;
	const start = ctx.start;
	const stop = ctx.stop;

	src.startLine = start.line;
	src.startColumn = start.charPositionInLine;
	src.startIndex = start.startIndex;

	src.stopLine = stop ? stop.line : start.line;
	src.stopColumn = stop ? stop.charPositionInLine : start.charPositionInLine;
	src.stopIndex = stop ? stop.stopIndex : start.stopIndex;

	src.file = file;
}

/**
 * File listener.
 */
class ASMListenerFile extends Object
implements ASMListener {
	/**
	 * Source file.
	 */
	public sourceFile = new SourceFile('');

	/**
	 * File object.
	 */
	public file = new ASTNodeFile();

	constructor() {
		super();
	}

	/**
	 * File context handler.
	 *
	 * @param ctx Context.
	 */
	public enterFile(ctx: FileContext) {
		copySourceData(this.sourceFile, this.file, ctx);

		const statementsListener = new ASMListenerStatements();
		statementsListener.sourceFile = this.sourceFile;
		ctx.statements().enterRule(statementsListener);
		this.file.statements = statementsListener.statements;
	}
}

/**
 * Statements listener.
 */
class ASMListenerStatements extends Object
implements ASMListener {
	/**
	 * Source file.
	 */
	public sourceFile = new SourceFile('');

	/**
	 * Statements collection.
	 */
	public statements = new ASTNodeStatements();

	constructor() {
		super();
	}

	/**
	 * Statements context handler.
	 *
	 * @param ctx Context.
	 */
	public enterStatements(ctx: StatementsContext) {
		copySourceData(this.sourceFile, this.statements, ctx);

		const statementListener = new ASMListenerStatement();
		statementListener.sourceFile = this.sourceFile;
		for (const statement of ctx.statement()) {
			statement.enterRule(statementListener);
		}
		this.statements.entries = statementListener.statements;
	}
}

/**
 * Statement listener.
 */
class ASMListenerStatement extends Object
implements ASMListener {
	/**
	 * Source file.
	 */
	public sourceFile = new SourceFile('');

	/**
	 * Statement list.
	 */
	public statements: ASTNodeStatement[] = [];

	constructor() {
		super();
	}

	/**
	 * Statement context handler.
	 *
	 * @param ctx Context.
	 */
	public enterStatement(ctx: StatementContext) {
		const instruction = ctx.instruction();
		if (instruction) {
			this.orInstruction(instruction);
			return;
		}

		const block = ctx.block();
		if (block) {
			this.orBlock(block);
			return;
		}

		const line = ctx.line();
		if (line) {
			this.orLine(line);
			return;
		}

		// Should never reach this unless out of sync with grammar.
		throw new ExceptionInternal('Unhandled antlr StatementContext option');
	}

	/**
	 * Handle instruction context.
	 *
	 * @param ctx Context.
	 */
	public orInstruction(ctx: InstructionContext) {
		const ctxIdentifier = ctx.identifier();
		const argumentsListener = new ASMListenerArguments();
		argumentsListener.sourceFile = this.sourceFile;
		ctx.arguments().enterRule(argumentsListener);
		const ctxComment = ctx.comment();

		const instruction = new ASTNodeStatementInstruction();
		copySourceData(this.sourceFile, instruction, ctx);

		instruction.identifier.text = ctxIdentifier.text;
		copySourceData(this.sourceFile, instruction.identifier, ctxIdentifier);

		instruction.arguments = argumentsListener.arguments;

		instruction.comment.text = ctxComment.text;
		copySourceData(this.sourceFile, instruction.comment, ctxComment);

		this.statements.push(instruction);
	}

	/**
	 * Handle block context.
	 *
	 * @param ctx Context.
	 */
	public orBlock(ctx: BlockContext) {
		const ctxBegin = ctx.begin();
		const ctxBeginId = ctxBegin.identifier();
		const argumentsListener = new ASMListenerArguments();
		argumentsListener.sourceFile = this.sourceFile;
		ctxBegin.arguments().enterRule(argumentsListener);
		const ctxBeginComment = ctxBegin.comment();

		const ctxEnd = ctx.end();
		const ctxEndComment = ctxEnd.comment();

		const statementsListener = new ASMListenerStatements();
		statementsListener.sourceFile = this.sourceFile;
		ctx.statements().enterRule(statementsListener);

		const block = new ASTNodeStatementBlock();
		copySourceData(this.sourceFile, block, ctx);

		copySourceData(this.sourceFile, block.begin, ctxBegin);

		block.begin.identifier.text = ctxBeginId.text;
		copySourceData(this.sourceFile, block.begin.identifier, ctxBeginId);

		block.begin.arguments = argumentsListener.arguments;

		block.begin.comment.text = ctxBeginComment.text;
		copySourceData(this.sourceFile, block.begin.comment, ctxBeginComment);

		copySourceData(this.sourceFile, block.end, ctxEnd);

		block.end.comment.text = ctxEndComment.text;
		copySourceData(this.sourceFile, block.end.comment, ctxEndComment);

		block.statements = statementsListener.statements;
		this.statements.push(block);
	}

	/**
	 * Handle line context.
	 *
	 * @param ctx Context.
	 */
	public orLine(ctx: LineContext) {
		const ctxComment = ctx.comment();

		const line = new ASTNodeStatementLine();
		copySourceData(this.sourceFile, line, ctx);

		line.comment.text = ctxComment.text;
		copySourceData(this.sourceFile, line.comment, ctxComment);

		this.statements.push(line);
	}
}

/**
 * Arguments listener.
 */
class ASMListenerArguments extends Object
implements ASMListener {
	/**
	 * Source file.
	 */
	public sourceFile = new SourceFile('');

	/**
	 * Arguments collection.
	 */
	public arguments = new ASTNodeArguments();

	constructor() {
		super();
	}

	/**
	 * Arguments context handler.
	 *
	 * @param ctx Context.
	 */
	public enterArguments(ctx: ArgumentsContext) {
		copySourceData(this.sourceFile, this.arguments, ctx);
		const argumentListener = new ASMListenerArgument();
		argumentListener.sourceFile = this.sourceFile;
		for (const arg of ctx.argument()) {
			arg.enterRule(argumentListener);
		}
		this.arguments.entries = argumentListener.arguments;
	}
}

/**
 * Argument listener.
 */
class ASMListenerArgument extends Object
implements ASMListener {
	/**
	 * Source file.
	 */
	public sourceFile = new SourceFile('');

	/**
	 * Argument list.
	 */
	public arguments: ASTNodeArgument[] = [];

	constructor() {
		super();
	}

	/**
	 * Argument context handler.
	 *
	 * @param ctx Context.
	 */
	public enterArgument(ctx: ArgumentContext) {
		const argumentNumber = ctx.argumentNumber();
		if (argumentNumber) {
			this.orArgumentNumber(argumentNumber);
			return;
		}

		const argumentString = ctx.argumentString();
		if (argumentString) {
			this.orArgumentString(argumentString);
			return;
		}

		// Should never reach this unless out of sync with grammar.
		throw new ExceptionInternal('Unhandled antlr ArgumentContext option');
	}

	/**
	 * Handle argument number context.
	 *
	 * @param ctx Context.
	 */
	public orArgumentNumber(ctx: ArgumentNumberContext) {
		const arg = new ASTNodeArgumentNumber();
		copySourceData(this.sourceFile, arg, ctx);
		arg.text = ctx.text;
		this.arguments.push(arg);
	}

	/**
	 * Handle argument string context.
	 *
	 * @param ctx Context.
	 */
	public orArgumentString(ctx: ArgumentStringContext) {
		const arg = new ASTNodeArgumentString();
		copySourceData(this.sourceFile, arg, ctx);
		arg.text = ctx.text;
		this.arguments.push(arg);
	}
}

/**
 * ParserDecoder constructor.
 */
export class ParserDecoder extends Parser {
	/**
	 * Syntax errors since the last reset.
	 */
	public syntaxErrors: ExceptionSyntax[] = [];

	constructor() {
		super();
	}

	/**
	 * Reset any stateful properties.
	 */
	public reset() {
		this.syntaxErrors = [];
	}

	/**
	 * Parse and decode ASM to AST.
	 *
	 * @param code Assembly code.
	 * @param name Optional source file name used in the AST.
	 * @return The AST instance and any errors.
	 */
	public decode(code: string, name = '') {
		const sourceFile = new SourceFile(code, name);

		const inputStream = CharStreams.fromString(code, name);

		const lexer = new ASMLexer(inputStream);
		lexer.removeErrorListeners();
		lexer.addErrorListener({
			syntaxError: (
				recognizer,
				offendingSymbol,
				line,
				charPositionInLine,
				msg,
				e
			) => {
				const column = charPositionInLine + 1;
				this.syntaxErrors.push(
					new ExceptionSyntax(msg, sourceFile, line, column)
				);
			}
		});

		// If syntax errors, throw first one.
		if (this.syntaxErrors.length) {
			throw this.syntaxErrors[0];
		}

		const tokenStream = new CommonTokenStream(lexer);

		const parser = new ASMParser(tokenStream);
		parser.removeErrorListeners();
		parser.addErrorListener({
			syntaxError: (
				recognizer,
				offendingSymbol,
				line,
				charPositionInLine,
				msg,
				e
			) => {
				const column = charPositionInLine + 1;
				this.syntaxErrors.push(
					new ExceptionSyntax(msg, sourceFile, line, column)
				);
			}
		});

		// If syntax errors, throw first one.
		if (this.syntaxErrors.length) {
			throw this.syntaxErrors[0];
		}

		// Trigger parsing, may cause syntax errors.
		const file = parser.file();

		// If syntax errors, throw first one.
		if (this.syntaxErrors.length) {
			throw this.syntaxErrors[0];
		}

		// File parsed without errors, create AST.
		const fileListener = new ASMListenerFile();
		fileListener.sourceFile = sourceFile;
		file.enterRule(fileListener);
		return fileListener.file;
	}
}
