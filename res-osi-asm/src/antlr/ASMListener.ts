// Generated from antlr/ASM.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { FileContext } from "./ASMParser";
import { StatementsContext } from "./ASMParser";
import { StatementContext } from "./ASMParser";
import { LineContext } from "./ASMParser";
import { InstructionContext } from "./ASMParser";
import { BlockContext } from "./ASMParser";
import { BeginContext } from "./ASMParser";
import { EndContext } from "./ASMParser";
import { ArgumentsContext } from "./ASMParser";
import { ArgumentContext } from "./ASMParser";
import { ArgumentNumberContext } from "./ASMParser";
import { ArgumentStringContext } from "./ASMParser";
import { CommentContext } from "./ASMParser";
import { IdentifierContext } from "./ASMParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `ASMParser`.
 */
export interface ASMListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `ASMParser.file`.
	 * @param ctx the parse tree
	 */
	enterFile?: (ctx: FileContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.file`.
	 * @param ctx the parse tree
	 */
	exitFile?: (ctx: FileContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.statements`.
	 * @param ctx the parse tree
	 */
	enterStatements?: (ctx: StatementsContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.statements`.
	 * @param ctx the parse tree
	 */
	exitStatements?: (ctx: StatementsContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.statement`.
	 * @param ctx the parse tree
	 */
	enterStatement?: (ctx: StatementContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.statement`.
	 * @param ctx the parse tree
	 */
	exitStatement?: (ctx: StatementContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.line`.
	 * @param ctx the parse tree
	 */
	enterLine?: (ctx: LineContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.line`.
	 * @param ctx the parse tree
	 */
	exitLine?: (ctx: LineContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.instruction`.
	 * @param ctx the parse tree
	 */
	enterInstruction?: (ctx: InstructionContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.instruction`.
	 * @param ctx the parse tree
	 */
	exitInstruction?: (ctx: InstructionContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.block`.
	 * @param ctx the parse tree
	 */
	enterBlock?: (ctx: BlockContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.block`.
	 * @param ctx the parse tree
	 */
	exitBlock?: (ctx: BlockContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.begin`.
	 * @param ctx the parse tree
	 */
	enterBegin?: (ctx: BeginContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.begin`.
	 * @param ctx the parse tree
	 */
	exitBegin?: (ctx: BeginContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.end`.
	 * @param ctx the parse tree
	 */
	enterEnd?: (ctx: EndContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.end`.
	 * @param ctx the parse tree
	 */
	exitEnd?: (ctx: EndContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.arguments`.
	 * @param ctx the parse tree
	 */
	enterArguments?: (ctx: ArgumentsContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.arguments`.
	 * @param ctx the parse tree
	 */
	exitArguments?: (ctx: ArgumentsContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.argument`.
	 * @param ctx the parse tree
	 */
	enterArgument?: (ctx: ArgumentContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.argument`.
	 * @param ctx the parse tree
	 */
	exitArgument?: (ctx: ArgumentContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.argumentNumber`.
	 * @param ctx the parse tree
	 */
	enterArgumentNumber?: (ctx: ArgumentNumberContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.argumentNumber`.
	 * @param ctx the parse tree
	 */
	exitArgumentNumber?: (ctx: ArgumentNumberContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.argumentString`.
	 * @param ctx the parse tree
	 */
	enterArgumentString?: (ctx: ArgumentStringContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.argumentString`.
	 * @param ctx the parse tree
	 */
	exitArgumentString?: (ctx: ArgumentStringContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.comment`.
	 * @param ctx the parse tree
	 */
	enterComment?: (ctx: CommentContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.comment`.
	 * @param ctx the parse tree
	 */
	exitComment?: (ctx: CommentContext) => void;

	/**
	 * Enter a parse tree produced by `ASMParser.identifier`.
	 * @param ctx the parse tree
	 */
	enterIdentifier?: (ctx: IdentifierContext) => void;
	/**
	 * Exit a parse tree produced by `ASMParser.identifier`.
	 * @param ctx the parse tree
	 */
	exitIdentifier?: (ctx: IdentifierContext) => void;
}

