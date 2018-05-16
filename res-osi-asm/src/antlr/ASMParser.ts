// Generated from antlr/ASM.g4 by ANTLR 4.6-SNAPSHOT


import { ATN } from 'antlr4ts/atn/ATN';
import { ATNDeserializer } from 'antlr4ts/atn/ATNDeserializer';
import { FailedPredicateException } from 'antlr4ts/FailedPredicateException';
import { NotNull } from 'antlr4ts/Decorators';
import { NoViableAltException } from 'antlr4ts/NoViableAltException';
import { Override } from 'antlr4ts/Decorators';
import { Parser } from 'antlr4ts/Parser';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ParserATNSimulator } from 'antlr4ts/atn/ParserATNSimulator';
import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';
import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';
import { RecognitionException } from 'antlr4ts/RecognitionException';
import { RuleContext } from 'antlr4ts/RuleContext';
import { RuleVersion } from 'antlr4ts/RuleVersion';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Token } from 'antlr4ts/Token';
import { TokenStream } from 'antlr4ts/TokenStream';
import { Vocabulary } from 'antlr4ts/Vocabulary';
import { VocabularyImpl } from 'antlr4ts/VocabularyImpl';

import * as Utils from 'antlr4ts/misc/Utils';

import { ASMListener } from './ASMListener';

export class ASMParser extends Parser {
	public static readonly COMMENT=1;
	public static readonly BEGIN=2;
	public static readonly END=3;
	public static readonly COMMA=4;
	public static readonly STRING=5;
	public static readonly NUMBER=6;
	public static readonly IDENTIFIER=7;
	public static readonly NL=8;
	public static readonly WS=9;
	public static readonly RULE_file = 0;
	public static readonly RULE_statements = 1;
	public static readonly RULE_statement = 2;
	public static readonly RULE_line = 3;
	public static readonly RULE_instruction = 4;
	public static readonly RULE_block = 5;
	public static readonly RULE_begin = 6;
	public static readonly RULE_end = 7;
	public static readonly RULE_arguments = 8;
	public static readonly RULE_argument = 9;
	public static readonly RULE_argumentNumber = 10;
	public static readonly RULE_argumentString = 11;
	public static readonly RULE_comment = 12;
	public static readonly RULE_identifier = 13;
	public static readonly ruleNames: string[] = [
		"file", "statements", "statement", "line", "instruction", "block", "begin", 
		"end", "arguments", "argument", "argumentNumber", "argumentString", "comment", 
		"identifier"
	];

	private static readonly _LITERAL_NAMES: (string | undefined)[] = [
		undefined, undefined, "'begin'", "'end'", "','"
	];
	private static readonly _SYMBOLIC_NAMES: (string | undefined)[] = [
		undefined, "COMMENT", "BEGIN", "END", "COMMA", "STRING", "NUMBER", "IDENTIFIER", 
		"NL", "WS"
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(ASMParser._LITERAL_NAMES, ASMParser._SYMBOLIC_NAMES, []);

	@Override
	@NotNull
	public get vocabulary(): Vocabulary {
		return ASMParser.VOCABULARY;
	}

	@Override
	public get grammarFileName(): string { return "ASM.g4"; }

	@Override
	public get ruleNames(): string[] { return ASMParser.ruleNames; }

	@Override
	public get serializedATN(): string { return ASMParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(ASMParser._ATN, this);
	}
	@RuleVersion(0)
	public file(): FileContext {
		let _localctx: FileContext = new FileContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, ASMParser.RULE_file);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 28;
			this.statements();
			this.state = 29;
			this.match(ASMParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public statements(): StatementsContext {
		let _localctx: StatementsContext = new StatementsContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, ASMParser.RULE_statements);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 34;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ASMParser.COMMENT) | (1 << ASMParser.BEGIN) | (1 << ASMParser.IDENTIFIER) | (1 << ASMParser.NL))) !== 0)) {
				{
				{
				this.state = 31;
				this.statement();
				}
				}
				this.state = 36;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public statement(): StatementContext {
		let _localctx: StatementContext = new StatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, ASMParser.RULE_statement);
		try {
			this.state = 40;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ASMParser.COMMENT:
			case ASMParser.NL:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 37;
				this.line();
				}
				break;
			case ASMParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 38;
				this.instruction();
				}
				break;
			case ASMParser.BEGIN:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 39;
				this.block();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public line(): LineContext {
		let _localctx: LineContext = new LineContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, ASMParser.RULE_line);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 42;
			this.comment();
			this.state = 43;
			this.match(ASMParser.NL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public instruction(): InstructionContext {
		let _localctx: InstructionContext = new InstructionContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, ASMParser.RULE_instruction);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 45;
			this.identifier();
			this.state = 46;
			this.arguments();
			this.state = 47;
			this.comment();
			this.state = 48;
			this.match(ASMParser.NL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public block(): BlockContext {
		let _localctx: BlockContext = new BlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, ASMParser.RULE_block);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 50;
			this.begin();
			this.state = 51;
			this.statements();
			this.state = 52;
			this.end();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public begin(): BeginContext {
		let _localctx: BeginContext = new BeginContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, ASMParser.RULE_begin);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 54;
			this.match(ASMParser.BEGIN);
			this.state = 55;
			this.identifier();
			this.state = 56;
			this.arguments();
			this.state = 57;
			this.comment();
			this.state = 58;
			this.match(ASMParser.NL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public end(): EndContext {
		let _localctx: EndContext = new EndContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, ASMParser.RULE_end);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 60;
			this.match(ASMParser.END);
			this.state = 61;
			this.comment();
			this.state = 62;
			this.match(ASMParser.NL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public arguments(): ArgumentsContext {
		let _localctx: ArgumentsContext = new ArgumentsContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, ASMParser.RULE_arguments);
		let _la: number;
		try {
			this.state = 73;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ASMParser.COMMENT:
			case ASMParser.NL:
				this.enterOuterAlt(_localctx, 1);
				{
				}
				break;
			case ASMParser.STRING:
			case ASMParser.NUMBER:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 65;
				this.argument();
				this.state = 70;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===ASMParser.COMMA) {
					{
					{
					this.state = 66;
					this.match(ASMParser.COMMA);
					this.state = 67;
					this.argument();
					}
					}
					this.state = 72;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public argument(): ArgumentContext {
		let _localctx: ArgumentContext = new ArgumentContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, ASMParser.RULE_argument);
		try {
			this.state = 77;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ASMParser.NUMBER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 75;
				this.argumentNumber();
				}
				break;
			case ASMParser.STRING:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 76;
				this.argumentString();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public argumentNumber(): ArgumentNumberContext {
		let _localctx: ArgumentNumberContext = new ArgumentNumberContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, ASMParser.RULE_argumentNumber);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 79;
			this.match(ASMParser.NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public argumentString(): ArgumentStringContext {
		let _localctx: ArgumentStringContext = new ArgumentStringContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, ASMParser.RULE_argumentString);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 81;
			this.match(ASMParser.STRING);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public comment(): CommentContext {
		let _localctx: CommentContext = new CommentContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, ASMParser.RULE_comment);
		try {
			this.state = 85;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ASMParser.NL:
				this.enterOuterAlt(_localctx, 1);
				{
				}
				break;
			case ASMParser.COMMENT:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 84;
				this.match(ASMParser.COMMENT);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public identifier(): IdentifierContext {
		let _localctx: IdentifierContext = new IdentifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, ASMParser.RULE_identifier);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 87;
			this.match(ASMParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03\v\\\x04\x02\t"+
		"\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07\t"+
		"\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04\x0E"+
		"\t\x0E\x04\x0F\t\x0F\x03\x02\x03\x02\x03\x02\x03\x03\x07\x03#\n\x03\f"+
		"\x03\x0E\x03&\v\x03\x03\x04\x03\x04\x03\x04\x05\x04+\n\x04\x03\x05\x03"+
		"\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x07\x03\x07\x03"+
		"\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03"+
		"\t\x03\n\x03\n\x03\n\x03\n\x07\nG\n\n\f\n\x0E\nJ\v\n\x05\nL\n\n\x03\v"+
		"\x03\v\x05\vP\n\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x05\x0EX\n\x0E"+
		"\x03\x0F\x03\x0F\x03\x0F\x02\x02\x02\x10\x02\x02\x04\x02\x06\x02\b\x02"+
		"\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C"+
		"\x02\x02\x02T\x02\x1E\x03\x02\x02\x02\x04$\x03\x02\x02\x02\x06*\x03\x02"+
		"\x02\x02\b,\x03\x02\x02\x02\n/\x03\x02\x02\x02\f4\x03\x02\x02\x02\x0E"+
		"8\x03\x02\x02\x02\x10>\x03\x02\x02\x02\x12K\x03\x02\x02\x02\x14O\x03\x02"+
		"\x02\x02\x16Q\x03\x02\x02\x02\x18S\x03\x02\x02\x02\x1AW\x03\x02\x02\x02"+
		"\x1CY\x03\x02\x02\x02\x1E\x1F\x05\x04\x03\x02\x1F \x07\x02\x02\x03 \x03"+
		"\x03\x02\x02\x02!#\x05\x06\x04\x02\"!\x03\x02\x02\x02#&\x03\x02\x02\x02"+
		"$\"\x03\x02\x02\x02$%\x03\x02\x02\x02%\x05\x03\x02\x02\x02&$\x03\x02\x02"+
		"\x02\'+\x05\b\x05\x02(+\x05\n\x06\x02)+\x05\f\x07\x02*\'\x03\x02\x02\x02"+
		"*(\x03\x02\x02\x02*)\x03\x02\x02\x02+\x07\x03\x02\x02\x02,-\x05\x1A\x0E"+
		"\x02-.\x07\n\x02\x02.\t\x03\x02\x02\x02/0\x05\x1C\x0F\x0201\x05\x12\n"+
		"\x0212\x05\x1A\x0E\x0223\x07\n\x02\x023\v\x03\x02\x02\x0245\x05\x0E\b"+
		"\x0256\x05\x04\x03\x0267\x05\x10\t\x027\r\x03\x02\x02\x0289\x07\x04\x02"+
		"\x029:\x05\x1C\x0F\x02:;\x05\x12\n\x02;<\x05\x1A\x0E\x02<=\x07\n\x02\x02"+
		"=\x0F\x03\x02\x02\x02>?\x07\x05\x02\x02?@\x05\x1A\x0E\x02@A\x07\n\x02"+
		"\x02A\x11\x03\x02\x02\x02BL\x03\x02\x02\x02CH\x05\x14\v\x02DE\x07\x06"+
		"\x02\x02EG\x05\x14\v\x02FD\x03\x02\x02\x02GJ\x03\x02\x02\x02HF\x03\x02"+
		"\x02\x02HI\x03\x02\x02\x02IL\x03\x02\x02\x02JH\x03\x02\x02\x02KB\x03\x02"+
		"\x02\x02KC\x03\x02\x02\x02L\x13\x03\x02\x02\x02MP\x05\x16\f\x02NP\x05"+
		"\x18\r\x02OM\x03\x02\x02\x02ON\x03\x02\x02\x02P\x15\x03\x02\x02\x02QR"+
		"\x07\b\x02\x02R\x17\x03\x02\x02\x02ST\x07\x07\x02\x02T\x19\x03\x02\x02"+
		"\x02UX\x03\x02\x02\x02VX\x07\x03\x02\x02WU\x03\x02\x02\x02WV\x03\x02\x02"+
		"\x02X\x1B\x03\x02\x02\x02YZ\x07\t\x02\x02Z\x1D\x03\x02\x02\x02\b$*HKO"+
		"W";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ASMParser.__ATN) {
			ASMParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(ASMParser._serializedATN));
		}

		return ASMParser.__ATN;
	}

}

export class FileContext extends ParserRuleContext {
	public statements(): StatementsContext {
		return this.getRuleContext(0, StatementsContext);
	}
	public EOF(): TerminalNode { return this.getToken(ASMParser.EOF, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_file; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterFile) listener.enterFile(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitFile) listener.exitFile(this);
	}
}


export class StatementsContext extends ParserRuleContext {
	public statement(): StatementContext[];
	public statement(i: number): StatementContext;
	public statement(i?: number): StatementContext | StatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatementContext);
		} else {
			return this.getRuleContext(i, StatementContext);
		}
	}
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_statements; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterStatements) listener.enterStatements(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitStatements) listener.exitStatements(this);
	}
}


export class StatementContext extends ParserRuleContext {
	public line(): LineContext | undefined {
		return this.tryGetRuleContext(0, LineContext);
	}
	public instruction(): InstructionContext | undefined {
		return this.tryGetRuleContext(0, InstructionContext);
	}
	public block(): BlockContext | undefined {
		return this.tryGetRuleContext(0, BlockContext);
	}
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_statement; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterStatement) listener.enterStatement(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitStatement) listener.exitStatement(this);
	}
}


export class LineContext extends ParserRuleContext {
	public comment(): CommentContext {
		return this.getRuleContext(0, CommentContext);
	}
	public NL(): TerminalNode { return this.getToken(ASMParser.NL, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_line; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterLine) listener.enterLine(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitLine) listener.exitLine(this);
	}
}


export class InstructionContext extends ParserRuleContext {
	public identifier(): IdentifierContext {
		return this.getRuleContext(0, IdentifierContext);
	}
	public arguments(): ArgumentsContext {
		return this.getRuleContext(0, ArgumentsContext);
	}
	public comment(): CommentContext {
		return this.getRuleContext(0, CommentContext);
	}
	public NL(): TerminalNode { return this.getToken(ASMParser.NL, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_instruction; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterInstruction) listener.enterInstruction(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitInstruction) listener.exitInstruction(this);
	}
}


export class BlockContext extends ParserRuleContext {
	public begin(): BeginContext {
		return this.getRuleContext(0, BeginContext);
	}
	public statements(): StatementsContext {
		return this.getRuleContext(0, StatementsContext);
	}
	public end(): EndContext {
		return this.getRuleContext(0, EndContext);
	}
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_block; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterBlock) listener.enterBlock(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitBlock) listener.exitBlock(this);
	}
}


export class BeginContext extends ParserRuleContext {
	public BEGIN(): TerminalNode { return this.getToken(ASMParser.BEGIN, 0); }
	public identifier(): IdentifierContext {
		return this.getRuleContext(0, IdentifierContext);
	}
	public arguments(): ArgumentsContext {
		return this.getRuleContext(0, ArgumentsContext);
	}
	public comment(): CommentContext {
		return this.getRuleContext(0, CommentContext);
	}
	public NL(): TerminalNode { return this.getToken(ASMParser.NL, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_begin; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterBegin) listener.enterBegin(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitBegin) listener.exitBegin(this);
	}
}


export class EndContext extends ParserRuleContext {
	public END(): TerminalNode { return this.getToken(ASMParser.END, 0); }
	public comment(): CommentContext {
		return this.getRuleContext(0, CommentContext);
	}
	public NL(): TerminalNode { return this.getToken(ASMParser.NL, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_end; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterEnd) listener.enterEnd(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitEnd) listener.exitEnd(this);
	}
}


export class ArgumentsContext extends ParserRuleContext {
	public argument(): ArgumentContext[];
	public argument(i: number): ArgumentContext;
	public argument(i?: number): ArgumentContext | ArgumentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ArgumentContext);
		} else {
			return this.getRuleContext(i, ArgumentContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ASMParser.COMMA);
		} else {
			return this.getToken(ASMParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_arguments; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterArguments) listener.enterArguments(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitArguments) listener.exitArguments(this);
	}
}


export class ArgumentContext extends ParserRuleContext {
	public argumentNumber(): ArgumentNumberContext | undefined {
		return this.tryGetRuleContext(0, ArgumentNumberContext);
	}
	public argumentString(): ArgumentStringContext | undefined {
		return this.tryGetRuleContext(0, ArgumentStringContext);
	}
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_argument; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterArgument) listener.enterArgument(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitArgument) listener.exitArgument(this);
	}
}


export class ArgumentNumberContext extends ParserRuleContext {
	public NUMBER(): TerminalNode { return this.getToken(ASMParser.NUMBER, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_argumentNumber; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterArgumentNumber) listener.enterArgumentNumber(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitArgumentNumber) listener.exitArgumentNumber(this);
	}
}


export class ArgumentStringContext extends ParserRuleContext {
	public STRING(): TerminalNode { return this.getToken(ASMParser.STRING, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_argumentString; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterArgumentString) listener.enterArgumentString(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitArgumentString) listener.exitArgumentString(this);
	}
}


export class CommentContext extends ParserRuleContext {
	public COMMENT(): TerminalNode | undefined { return this.tryGetToken(ASMParser.COMMENT, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_comment; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterComment) listener.enterComment(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitComment) listener.exitComment(this);
	}
}


export class IdentifierContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(ASMParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ASMParser.RULE_identifier; }
	@Override
	public enterRule(listener: ASMListener): void {
		if (listener.enterIdentifier) listener.enterIdentifier(this);
	}
	@Override
	public exitRule(listener: ASMListener): void {
		if (listener.exitIdentifier) listener.exitIdentifier(this);
	}
}


