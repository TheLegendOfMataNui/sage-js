// Generated from antlr/ASM.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class ASMLexer extends Lexer {
	public static readonly COMMENT = 1;
	public static readonly BEGIN = 2;
	public static readonly END = 3;
	public static readonly COMMA = 4;
	public static readonly STRING = 5;
	public static readonly NUMBER = 6;
	public static readonly IDENTIFIER = 7;
	public static readonly NL = 8;
	public static readonly WS = 9;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"COMMENT", "BEGIN", "END", "COMMA", "STRING", "NUMBER", "IDENTIFIER", 
		"NL", "WS", "INT", "FLOAT", "INFINITY", "NAN", "EXP", "INT_HEX", "INT_BIN", 
		"INT_OCTAL", "HEX", "STRING_UNICODE", "STRING_ESC", "STRING_CHARS",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, "'begin'", "'end'", "','",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "COMMENT", "BEGIN", "END", "COMMA", "STRING", "NUMBER", "IDENTIFIER", 
		"NL", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(ASMLexer._LITERAL_NAMES, ASMLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return ASMLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(ASMLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "ASM.g4"; }

	// @Override
	public get ruleNames(): string[] { return ASMLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return ASMLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return ASMLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return ASMLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\v\xD3\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
		"\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12" +
		"\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x03\x02\x03\x02" +
		"\x07\x020\n\x02\f\x02\x0E\x023\v\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03" +
		"\x06\x03\x06\x07\x06D\n\x06\f\x06\x0E\x06G\v\x06\x03\x06\x03\x06\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x05\x07R\n\x07\x03\b" +
		"\x03\b\x07\bV\n\b\f\b\x0E\bY\v\b\x03\t\x03\t\x03\t\x05\t^\n\t\x03\n\x06" +
		"\na\n\n\r\n\x0E\nb\x03\n\x03\n\x03\v\x05\vh\n\v\x03\v\x03\v\x03\v\x07" +
		"\vm\n\v\f\v\x0E\vp\v\v\x05\vr\n\v\x03\f\x05\fu\n\f\x03\f\x03\f\x07\fy" +
		"\n\f\f\f\x0E\f|\v\f\x03\f\x05\f\x7F\n\f\x03\f\x03\f\x03\f\x07\f\x84\n" +
		"\f\f\f\x0E\f\x87\v\f\x03\f\x05\f\x8A\n\f\x03\f\x03\f\x03\f\x05\f\x8F\n" +
		"\f\x03\r\x05\r\x92\n\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r" +
		"\x03\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x10" +
		"\x05\x10\xA5\n\x10\x03\x10\x03\x10\x03\x10\x03\x10\x06\x10\xAB\n\x10\r" +
		"\x10\x0E\x10\xAC\x03\x11\x05\x11\xB0\n\x11\x03\x11\x03\x11\x03\x11\x03" +
		"\x11\x06\x11\xB6\n\x11\r\x11\x0E\x11\xB7\x03\x12\x05\x12\xBB\n\x12\x03" +
		"\x12\x03\x12\x03\x12\x03\x12\x06\x12\xC1\n\x12\r\x12\x0E\x12\xC2\x03\x13" +
		"\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x15\x03\x15" +
		"\x03\x15\x05\x15\xD0\n\x15\x03\x16\x03\x16\x02\x02\x02\x17\x03\x02\x03" +
		"\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r\x02\b\x0F\x02\t\x11\x02" +
		"\n\x13\x02\v\x15\x02\x02\x17\x02\x02\x19\x02\x02\x1B\x02\x02\x1D\x02\x02" +
		"\x1F\x02\x02!\x02\x02#\x02\x02%\x02\x02\'\x02\x02)\x02\x02+\x02\x02\x03" +
		"\x02\x0F\x04\x02\f\f\x0F\x0F\x05\x02C\\aac|\x06\x022;C\\aac|\x04\x02\v" +
		"\v\"\"\x04\x02--//\x03\x023;\x03\x022;\x04\x02GGgg\x03\x0223\x03\x022" +
		"9\x05\x022;CHch\n\x02$$11^^ddhhppttvv\x05\x02\x02!$$^^\x02\xE4\x02\x03" +
		"\x03\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t" +
		"\x03\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03" +
		"\x02\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x03-\x03" +
		"\x02\x02\x02\x054\x03\x02\x02\x02\x07:\x03\x02\x02\x02\t>\x03\x02\x02" +
		"\x02\v@\x03\x02\x02\x02\rQ\x03\x02\x02\x02\x0FS\x03\x02\x02\x02\x11]\x03" +
		"\x02\x02\x02\x13`\x03\x02\x02\x02\x15g\x03\x02\x02\x02\x17\x8E\x03\x02" +
		"\x02\x02\x19\x91\x03\x02\x02\x02\x1B\x9C\x03\x02\x02\x02\x1D\xA0\x03\x02" +
		"\x02\x02\x1F\xA4\x03\x02\x02\x02!\xAF\x03\x02\x02\x02#\xBA\x03\x02\x02" +
		"\x02%\xC4\x03\x02\x02\x02\'\xC6\x03\x02\x02\x02)\xCC\x03\x02\x02\x02+" +
		"\xD1\x03\x02\x02\x02-1\x07=\x02\x02.0\n\x02\x02\x02/.\x03\x02\x02\x02" +
		"03\x03\x02\x02\x021/\x03\x02\x02\x0212\x03\x02\x02\x022\x04\x03\x02\x02" +
		"\x0231\x03\x02\x02\x0245\x07d\x02\x0256\x07g\x02\x0267\x07i\x02\x0278" +
		"\x07k\x02\x0289\x07p\x02\x029\x06\x03\x02\x02\x02:;\x07g\x02\x02;<\x07" +
		"p\x02\x02<=\x07f\x02\x02=\b\x03\x02\x02\x02>?\x07.\x02\x02?\n\x03\x02" +
		"\x02\x02@E\x07$\x02\x02AD\x05)\x15\x02BD\x05+\x16\x02CA\x03\x02\x02\x02" +
		"CB\x03\x02\x02\x02DG\x03\x02\x02\x02EC\x03\x02\x02\x02EF\x03\x02\x02\x02" +
		"FH\x03\x02\x02\x02GE\x03\x02\x02\x02HI\x07$\x02\x02I\f\x03\x02\x02\x02" +
		"JR\x05\x17\f\x02KR\x05\x15\v\x02LR\x05\x1F\x10\x02MR\x05!\x11\x02NR\x05" +
		"#\x12\x02OR\x05\x19\r\x02PR\x05\x1B\x0E\x02QJ\x03\x02\x02\x02QK\x03\x02" +
		"\x02\x02QL\x03\x02\x02\x02QM\x03\x02\x02\x02QN\x03\x02\x02\x02QO\x03\x02" +
		"\x02\x02QP\x03\x02\x02\x02R\x0E\x03\x02\x02\x02SW\t\x03\x02\x02TV\t\x04" +
		"\x02\x02UT\x03\x02\x02\x02VY\x03\x02\x02\x02WU\x03\x02\x02\x02WX\x03\x02" +
		"\x02\x02X\x10\x03\x02\x02\x02YW\x03\x02\x02\x02Z[\x07\x0F\x02\x02[^\x07" +
		"\f\x02\x02\\^\t\x02\x02\x02]Z\x03\x02\x02\x02]\\\x03\x02\x02\x02^\x12" +
		"\x03\x02\x02\x02_a\t\x05\x02\x02`_\x03\x02\x02\x02ab\x03\x02\x02\x02b" +
		"`\x03\x02\x02\x02bc\x03\x02\x02\x02cd\x03\x02\x02\x02de\b\n\x02\x02e\x14" +
		"\x03\x02\x02\x02fh\t\x06\x02\x02gf\x03\x02\x02\x02gh\x03\x02\x02\x02h" +
		"q\x03\x02\x02\x02ir\x072\x02\x02jn\t\x07\x02\x02km\t\b\x02\x02lk\x03\x02" +
		"\x02\x02mp\x03\x02\x02\x02nl\x03\x02\x02\x02no\x03\x02\x02\x02or\x03\x02" +
		"\x02\x02pn\x03\x02\x02\x02qi\x03\x02\x02\x02qj\x03\x02\x02\x02r\x16\x03" +
		"\x02\x02\x02su\x05\x15\v\x02ts\x03\x02\x02\x02tu\x03\x02\x02\x02uv\x03" +
		"\x02\x02\x02vz\x070\x02\x02wy\t\b\x02\x02xw\x03\x02\x02\x02y|\x03\x02" +
		"\x02\x02zx\x03\x02\x02\x02z{\x03\x02\x02\x02{~\x03\x02\x02\x02|z\x03\x02" +
		"\x02\x02}\x7F\x05\x1D\x0F\x02~}\x03\x02\x02\x02~\x7F\x03\x02\x02\x02\x7F" +
		"\x8F\x03\x02\x02\x02\x80\x81\t\x06\x02\x02\x81\x85\x070\x02\x02\x82\x84" +
		"\t\b\x02\x02\x83\x82\x03\x02\x02\x02\x84\x87\x03\x02\x02\x02\x85\x83\x03" +
		"\x02\x02\x02\x85\x86\x03\x02\x02\x02\x86\x89\x03\x02\x02\x02\x87\x85\x03" +
		"\x02\x02\x02\x88\x8A\x05\x1D\x0F\x02\x89\x88\x03\x02\x02\x02\x89\x8A\x03" +
		"\x02\x02\x02\x8A\x8F\x03\x02\x02\x02\x8B\x8C\x05\x15\v\x02\x8C\x8D\x05" +
		"\x1D\x0F\x02\x8D\x8F\x03\x02\x02\x02\x8Et\x03\x02\x02\x02\x8E\x80\x03" +
		"\x02\x02\x02\x8E\x8B\x03\x02\x02\x02\x8F\x18\x03\x02\x02\x02\x90\x92\t" +
		"\x06\x02\x02\x91\x90\x03\x02\x02\x02\x91\x92\x03\x02\x02\x02\x92\x93\x03" +
		"\x02\x02\x02\x93\x94\x07K\x02\x02\x94\x95\x07p\x02\x02\x95\x96\x07h\x02" +
		"\x02\x96\x97\x07k\x02\x02\x97\x98\x07p\x02\x02\x98\x99\x07k\x02\x02\x99" +
		"\x9A\x07v\x02\x02\x9A\x9B\x07{\x02\x02\x9B\x1A\x03\x02\x02\x02\x9C\x9D" +
		"\x07P\x02\x02\x9D\x9E\x07c\x02\x02\x9E\x9F\x07P\x02\x02\x9F\x1C\x03\x02" +
		"\x02\x02\xA0\xA1\t\t\x02\x02\xA1\xA2\x05\x15\v\x02\xA2\x1E\x03\x02\x02" +
		"\x02\xA3\xA5\t\x06\x02\x02\xA4\xA3\x03\x02\x02\x02\xA4\xA5\x03\x02\x02" +
		"\x02\xA5\xA6\x03\x02\x02\x02\xA6\xA7\x072\x02\x02\xA7\xA8\x07z\x02\x02" +
		"\xA8\xAA\x03\x02\x02\x02\xA9\xAB\x05%\x13\x02\xAA\xA9\x03\x02\x02\x02" +
		"\xAB\xAC\x03\x02\x02\x02\xAC\xAA\x03\x02\x02\x02\xAC\xAD\x03\x02\x02\x02" +
		"\xAD \x03\x02\x02\x02\xAE\xB0\t\x06\x02\x02\xAF\xAE\x03\x02\x02\x02\xAF" +
		"\xB0\x03\x02\x02\x02\xB0\xB1\x03\x02\x02\x02\xB1\xB2\x072\x02\x02\xB2" +
		"\xB3\x07d\x02\x02\xB3\xB5\x03\x02\x02\x02\xB4\xB6\t\n\x02\x02\xB5\xB4" +
		"\x03\x02\x02\x02\xB6\xB7\x03\x02\x02\x02\xB7\xB5\x03\x02\x02\x02\xB7\xB8" +
		"\x03\x02\x02\x02\xB8\"\x03\x02\x02\x02\xB9\xBB\t\x06\x02\x02\xBA\xB9\x03" +
		"\x02\x02\x02\xBA\xBB\x03\x02\x02\x02\xBB\xBC\x03\x02\x02\x02\xBC\xBD\x07" +
		"2\x02\x02\xBD\xBE\x07q\x02\x02\xBE\xC0\x03\x02\x02\x02\xBF\xC1\t\v\x02" +
		"\x02\xC0\xBF\x03\x02\x02\x02\xC1\xC2\x03\x02\x02\x02\xC2\xC0\x03\x02\x02" +
		"\x02\xC2\xC3\x03\x02\x02\x02\xC3$\x03\x02\x02\x02\xC4\xC5\t\f\x02\x02" +
		"\xC5&\x03\x02\x02\x02\xC6\xC7\x07w\x02\x02\xC7\xC8\x05%\x13\x02\xC8\xC9" +
		"\x05%\x13\x02\xC9\xCA\x05%\x13\x02\xCA\xCB\x05%\x13\x02\xCB(\x03\x02\x02" +
		"\x02\xCC\xCF\x07^\x02\x02\xCD\xD0\t\r\x02\x02\xCE\xD0\x05\'\x14\x02\xCF" +
		"\xCD\x03\x02\x02\x02\xCF\xCE\x03\x02\x02\x02\xD0*\x03\x02\x02\x02\xD1" +
		"\xD2\n\x0E\x02\x02\xD2,\x03\x02\x02\x02\x1B\x021CEQW]bgnqtz~\x85\x89\x8E" +
		"\x91\xA4\xAC\xAF\xB7\xBA\xC2\xCF\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ASMLexer.__ATN) {
			ASMLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(ASMLexer._serializedATN));
		}

		return ASMLexer.__ATN;
	}

}

