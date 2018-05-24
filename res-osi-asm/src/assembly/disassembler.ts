import {
	Primitive,
	PrimitiveInt,
	PrimitiveFloat,
	PrimitiveString,
	utilNumberToHex
} from '@sage-js/core';
import {
	OSI,
	StringP8NTable,
	FunctionDefinition,
	IClassDefinitionTableEntry,
	ClassDefinitionProperty,
	ClassDefinitionMethod,
	ISubroutineTableEntry,
	Instruction,
	InstructionAbstractCompareAndBranchIfFalseBranchTarget,
	InstructionAbstractBranchAlwaysBranchTarget,
	InstructionBCLCompareAndBranchIfFalse,
	InstructionBCLBranchAlways,
	InstructionAbstractBranchTarget,
	InstructionBCLPushConstantString,
	InstructionBCLCreateObject,
	InstructionBCLGetThisMemberFunction,
	InstructionBCLGetThisMemberValue,
	InstructionBCLSetThisMemberValue,
	InstructionBCLGetMemberFunction,
	InstructionBCLGetMemberValue,
	InstructionBCLSetMemberValue,
	InstructionBCLLineNumberAlt1,
	InstructionBCLGetGameVariable,
	InstructionBCLSetGameVariable,
	InstructionBCLCallGameFunction,
	InstructionBCLCallGameFunctionFromString,
	InstructionBCLCallGameFunctionDirect,
	InstructionBCLGetVariableValue,
	InstructionBCLSetVariableValue,
	InstructionBCLPushConstantColor8888,
	InstructionBCLPushConstantColor5551
} from '@sage-js/res-osi';
import {typed} from '../typed';
import {
	MapSubroutineOffsetToId,
	MapFunctionOffsetToDefinitions,
	MapClassMethodOffsetToDefinitions,
	MapSourceRange
} from '../types';
import {ExceptionInternal} from '../exception/internal';
import {ExceptionInvalid} from '../exception/invalid';
import {ASTNodeFile} from '../ast/node/file';
import {ASTNodeComment} from '../ast/node/comment';
import {ASTNodeArgument} from '../ast/node/argument/class';
import {ASTNodeArgumentNumber} from '../ast/node/argument/number';
import {ASTNodeArgumentString} from '../ast/node/argument/string';
import {ASTNodeStatement} from '../ast/node/statement/class';
import {ASTNodeStatementInstruction} from '../ast/node/statement/instruction';
import {ASTNodeStatementBlock} from '../ast/node/statement/block';
import {ASTNodeStatementLine} from '../ast/node/statement/line';
import {Assembly} from './class';

/**
 * AssemblyDisassembler constructor.
 */
export class AssemblyDisassembler extends Assembly {

	constructor() {
		super();
	}

	/**
	 * Reset any stateful properties.
	 */
	public reset() {
		// Does nothing at present.
	}

	/**
	 * Disassemble OSI to AST.
	 *
	 * @param osi OSI instance.
	 * @return AST file.
	 */
	public disassemble(osi: OSI) {
		const ast = new ASTNodeFile();

		// Helper functions.
		const entries = ast.statements.entries;
		const add = (...args: ASTNodeStatement[]) => {
			entries.push(...args);
		};
		const nl = () => {
			add(new ASTNodeStatementLine());
		};

		// Create mappings.
		const subroutineOffsetToId =
			this._disassembleMapSubroutineOffsetToId(osi);

		const functionsByOffset =
			this._disassembleMapFunctionOffsetToDefinitions(osi);

		const classMethodByOffset =
			this._disassembleMapClassMethodOffsetToDefinitions(osi);

		// Create the AST statements.
		add(...this.disassembleMetadata(osi));
		nl();
		add(...this.disassembleStrings(osi));
		nl();
		add(...this.disassembleGlobals(osi));
		nl();
		add(...this.disassembleSymbols(osi));
		nl();
		add(...this.disassembleSources(osi));
		nl();
		add(...this.disassembleFunctions(
			osi,
			subroutineOffsetToId
		));
		nl();
		add(...this.disassembleClasses(
			osi,
			subroutineOffsetToId
		));

		for (const entry of osi.subroutines.itter()) {
			nl();
			add(...this.disassembleSubroutine(
				osi,
				entry,
				subroutineOffsetToId,
				functionsByOffset,
				classMethodByOffset
			));
		}

		return ast;
	}

	/**
	 * Encode OSI AST metadata.
	 *
	 * @param osi OSI instance.
	 * @return AST statements.
	 */
	public disassembleMetadata(osi: OSI): ASTNodeStatement[] {
		const ast = this._disassembleCreateStatementBlock('metadata');

		const version = this._disassembleCreateStatementInstruction('version');

		version.arguments.entries.push(
			this._disassembleCreateArgumentFromInt(osi.header.versionMajor)
		);
		version.arguments.entries.push(
			this._disassembleCreateArgumentFromInt(osi.header.versionMinor)
		);

		ast.statements.entries.push(version);

		return [ast];
	}

	/**
	 * Encode OSI AST strings.
	 *
	 * @param osi OSI instance.
	 * @return AST statements.
	 */
	public disassembleStrings(osi: OSI): ASTNodeStatement[] {
		return this.disassembleStringP8NTable(
			osi.header.stringTable,
			'strings',
			'string'
		);
	}

	/**
	 * Encode OSI AST globals.
	 *
	 * @param osi OSI instance.
	 * @return AST statements.
	 */
	public disassembleGlobals(osi: OSI): ASTNodeStatement[] {
		return this.disassembleStringP8NTable(
			osi.header.globalTable,
			'globals',
			'global'
		);
	}

	/**
	 * Encode OSI AST symbols.
	 *
	 * @param osi OSI instance.
	 * @return AST statements.
	 */
	public disassembleSymbols(osi: OSI): ASTNodeStatement[] {
		return this.disassembleStringP8NTable(
			osi.header.symbolTable,
			'symbols',
			'symbol'
		);
	}

	/**
	 * Encode OSI AST sources.
	 *
	 * @param osi OSI instance.
	 * @return AST statements.
	 */
	public disassembleSources(osi: OSI): ASTNodeStatement[] {
		return this.disassembleStringP8NTable(
			osi.header.sourceTable,
			'sources',
			'source'
		);
	}

	/**
	 * Encode OSI AST PrimitiveStringP8NTable.
	 *
	 * @param table Table to be encoded.
	 * @param name Block name.
	 * @param instruction Instruction names.
	 * @return AST statements.
	 */
	public disassembleStringP8NTable(
		table: StringP8NTable,
		name: string,
		instruction: string
	): ASTNodeStatement[] {
		const ast = this._disassembleCreateStatementBlock(name);
		const entries = ast.statements.entries;

		const tableEntries = table.entries;
		for (let i = 0; i < tableEntries.length; i++) {
			const entry = tableEntries[i];

			const inst = this._disassembleCreateStatementInstruction(
				instruction
			);

			inst.arguments.entries.push(
				this._disassembleCreateArgumentFromString(entry)
			);

			this._disassembleSetComment(inst.comment, `${i}`);

			entries.push(inst);
		}
		return [ast];
	}

	/**
	 * Encode OSI AST functions.
	 *
	 * @param osi OSI instance.
	 * @param subroutineOffsetToId Map of subroutine offsets to IDs.
	 * @return AST statements.
	 */
	public disassembleFunctions(
		osi: OSI,
		subroutineOffsetToId: MapSubroutineOffsetToId
	): ASTNodeStatement[] {
		const ast = this._disassembleCreateStatementBlock('functions');
		ast.begin.identifier.text = 'functions';

		const entries = ast.statements.entries;
		for (const func of osi.header.functionTable.entries) {
			entries.push(...this.disassembleFunction(
				osi,
				func,
				subroutineOffsetToId
			));
		}

		return [ast];
	}

	/**
	 * Encode OSI AST function.
	 *
	 * @param osi OSI instance.
	 * @param functionDefinition Function definition.
	 * @param subroutineOffsetToId Map of subroutine offsets to IDs.
	 * @return AST statements.
	 */
	public disassembleFunction(
		osi: OSI,
		functionDefinition: FunctionDefinition,
		subroutineOffsetToId: MapSubroutineOffsetToId
	): ASTNodeStatement[] {
		const ast = this._disassembleCreateStatementInstruction('function');

		const offset = functionDefinition.offset.value;
		const id = subroutineOffsetToId.get(offset);
		if (id === undefined) {
			throw new ExceptionInvalid(
				`No subroutine at offset: ${offset}`
			);
		}

		const argEntries = ast.arguments.entries;
		argEntries.push(
			this._disassembleCreateArgumentFromString(functionDefinition.name)
		);

		argEntries.push(
			this._disassembleCreateArgumentFromInt(functionDefinition.argc)
		);

		argEntries.push(
			this._disassembleCreateArgumentFromNumber(id)
		);

		return [ast];
	}

	/**
	 * Encode OSI AST classes.
	 *
	 * @param osi OSI instance.
	 * @param subroutineOffsetToId Map of subroutine offsets to IDs.
	 * @return AST statements.
	 */
	public disassembleClasses(
		osi: OSI,
		subroutineOffsetToId: MapSubroutineOffsetToId
	): ASTNodeStatement[] {
		const ast = this._disassembleCreateStatementBlock('classes');

		const entries = ast.statements.entries;
		const classEntries = osi.header.classTable.entries;
		for (let i = 0; i < classEntries.length; i++) {
			const definition = classEntries[i];
			entries.push(...this.disassembleClass(
				osi,
				definition,
				i,
				subroutineOffsetToId
			));
		}

		return [ast];
	}

	/**
	 * Encode OSI AST class.
	 *
	 * @param osi OSI instance.
	 * @param classDefinition Class definition.
	 * @param subroutineOffsetToId Map of subroutine offsets to IDs.
	 * @return AST statements.
	 */
	public disassembleClass(
		osi: OSI,
		classDefinition: IClassDefinitionTableEntry,
		index: number,
		subroutineOffsetToId: MapSubroutineOffsetToId
	): ASTNodeStatement[] {
		const {name, structure} = classDefinition;

		const ast = this._disassembleCreateStatementBlock('class');
		this._disassembleSetComment(ast.begin.comment, `${index}`);

		ast.begin.arguments.entries.push(
			this._disassembleCreateArgumentFromString(name)
		);

		const entries = ast.statements.entries;

		for (const property of structure.classPropertyTable.entries) {
			entries.push(...this.disassembleClassProperty(
				osi,
				property
			));
		}

		for (const method of structure.classMethodTable.entries) {
			entries.push(...this.disassembleClassMethod(
				osi,
				method,
				subroutineOffsetToId
			));
		}

		return [ast];
	}

	/**
	 * Encode OSI AST class property.
	 *
	 * @param osi OSI instance.
	 * @param property Class property.
	 * @return AST statements.
	 */
	public disassembleClassProperty(
		osi: OSI,
		property: ClassDefinitionProperty
	): ASTNodeStatement[] {
		const symbols = osi.header.symbolTable.entries;

		const ast = this._disassembleCreateStatementInstruction('property');

		ast.arguments.entries.push(
			this._disassembleCreateArgumentFromInt(property.symbol)
		);

		const symbol = symbols[property.symbol.value];
		if (symbol) {
			this._disassembleSetComment(ast.comment, symbol.stringEncode());
		}

		return [ast];
	}

	/**
	 * Encode OSI AST class property.
	 *
	 * @param osi OSI instance.
	 * @param property Class property.
	 * @return AST statements.
	 */
	public disassembleClassMethod(
		osi: OSI,
		method: ClassDefinitionMethod,
		subroutineOffsetToId: MapSubroutineOffsetToId
	): ASTNodeStatement[] {
		const symbols = osi.header.symbolTable.entries;

		const offset = method.offset.value;
		const id = subroutineOffsetToId.get(offset);
		if (id === undefined) {
			throw new ExceptionInvalid(
				`No subroutine at offset: ${offset}`
			);
		}

		const ast = this._disassembleCreateStatementInstruction('method');

		ast.arguments.entries.push(
			this._disassembleCreateArgumentFromInt(method.symbol)
		);

		ast.arguments.entries.push(
			this._disassembleCreateArgumentFromNumber(id)
		);

		const symbol = symbols[method.symbol.value];
		if (symbol) {
			this._disassembleSetComment(ast.comment, symbol.stringEncode());
		}

		return [ast];
	}

	/**
	 * Subroutine block from OSI.
	 *
	 * @param osi OSI instance.
	 * @param subroutineEntry Subroutine entry.
	 * @param subroutineOffsetToId Map offsets to ID.
	 * @param functionsByOffset Map function offset to function info.
	 * @param classMethodByOffset Map class offset to method info.
	 * @return AST statements.
	 */
	public disassembleSubroutine(
		osi: OSI,
		subroutineEntry: ISubroutineTableEntry,
		subroutineOffsetToId: MapSubroutineOffsetToId,
		functionsByOffset: MapFunctionOffsetToDefinitions,
		classMethodByOffset: MapClassMethodOffsetToDefinitions
	): ASTNodeStatement[] {
		const {offset, subroutine} = subroutineEntry;

		const symbols = osi.header.symbolTable.entries;
		const sources = osi.header.sourceTable.entries;

		const sourceMapRange: MapSourceRange = new Map();

		const off = offset.value;
		const id = subroutineOffsetToId.get(off);
		if (id === undefined) {
			throw new ExceptionInvalid(
				`No subroutine at offset: ${off}`
			);
		}

		const r: ASTNodeStatement[] = [];

		const addLine = (comment = '') => {
			const line = this._disassembleCreateStatementLine();
			this._disassembleSetComment(line.comment, comment);
			r.push(line);
		};

		const ast = this._disassembleCreateStatementBlock('subroutine');
		ast.begin.arguments.entries.push(
			this._disassembleCreateArgumentFromNumber(id)
		);
		addLine(`address: 0x${utilNumberToHex(off)}`);

		// Loop over the instructions.
		const entries = ast.statements.entries;
		for (const instruction of subroutine.instructions) {
			entries.push(...this.disassembleInstruction(
				osi,
				instruction,
				subroutineOffsetToId,
				functionsByOffset,
				classMethodByOffset,
				subroutineEntry,
				sourceMapRange
			));
		}

		// Add comment for source file range.
		for (const [index, range] of sourceMapRange) {
			const source = sources[index];
			if (!source) {
				addLine(`source: ${index} unknown ${range.join(':')}`);
				continue;
			}
			addLine(
				`source: ${index} ${source.stringEncode()} ${range.join(':')}`
			);
		}

		// Add comments for any function that references this.
		for (const func of functionsByOffset.get(off) || []) {
			addLine(`function: ${func.name.stringEncode()}`);
		}

		// Add comments for any methods that references this.
		for (const {
			classInfo,
			method
		} of classMethodByOffset.get(off) || []) {
			const symbol = symbols[method.symbol.value];
			const name = classInfo.name;
			addLine(`method: ${name.stringEncode()}.${symbol.stringEncode()}`);
		}

		r.push(ast);
		return r;
	}

	/**
	 * Subroutine block from OSI.
	 *
	 * @param osi OSI instance.
	 * @param instruction Subroutine instruction.
	 * @param subroutineOffsetToId Map offsets to ID.
	 * @param functionsByOffset Map function offset to function info.
	 * @param classMethodByOffset Map class offset to method info.
	 * @param subroutineEntry Subroutine entry.
	 * @param sourceMapRange Map sources to ranges.
	 * @return AST statements.
	 */
	public disassembleInstruction(
		osi: OSI,
		instruction: Instruction,
		subroutineOffsetToId: MapSubroutineOffsetToId,
		functionsByOffset: MapFunctionOffsetToDefinitions,
		classMethodByOffset: MapClassMethodOffsetToDefinitions,
		subroutineEntry: ISubroutineTableEntry,
		sourceMapRange: MapSourceRange
	) {
		const strings = osi.header.stringTable.entries;
		const symbols = osi.header.symbolTable.entries;
		const globals = osi.header.globalTable.entries;
		const classes = osi.header.classTable.entries;

		const r: ASTNodeStatement[] = [];

		const ast = this._disassembleCreateStatementInstruction(
			instruction.name
		);
		ast.arguments.entries = this.disassembleInstructionArguments(
			osi,
			instruction
		);

		let comment = '';
		let jumpedTo = false;
		let jumpedFrom = false;

		OUTER: do {
			// Create source file comment file and range info.
			{
				const cast =
					typed.cast(instruction, InstructionBCLLineNumberAlt1);
				if (cast) {
					const line = cast.arg0.value;
					const index = cast.arg1.value;
					const range = sourceMapRange.get(index);
					if (range) {
						range[0] = Math.min(range[0], line);
						range[1] = Math.max(range[1], line);
					}
					else {
						sourceMapRange.set(index, [line, line]);
					}
					break OUTER;
				}
			}

			// Lookup strings.
			{
				const cast =
					typed.cast(instruction, InstructionBCLPushConstantString);
				if (cast) {
					const index = cast.arg0.value;
					const str = strings[index];
					if (str) {
						comment = str.stringEncode();
					}
					else {
						comment = '?';
					}
					break OUTER;
				}
			}

			// Lookup class.
			{
				const cast =
					typed.cast(instruction, InstructionBCLCreateObject);
				if (cast) {
					const index = cast.arg0.value;
					const classEntry = classes[index];
					if (classEntry) {
						comment = classEntry.name.stringEncode();
					}
					else {
						comment = '?';
					}
					break OUTER;
				}
			}

			// Loopup symbols.
			for (const Instruction of [
				InstructionBCLGetThisMemberFunction,
				InstructionBCLGetThisMemberValue,
				InstructionBCLSetThisMemberValue,
				InstructionBCLGetMemberFunction,
				InstructionBCLGetMemberValue,
				InstructionBCLSetMemberValue
			]) {
				const cast = typed.cast(instruction, Instruction);
				if (!cast) {
					continue;
				}
				const index = cast.arg0.value;
				const symbol = symbols[index];
				if (symbol) {
					comment = symbol.stringEncode();
				}
				else {
					comment = '?';
				}
				break OUTER;
			}

			// Lookup strings for functions.
			{
				const cast = typed.cast(
					instruction,
					InstructionBCLCallGameFunctionFromString
				);
				if (cast) {
					const index = cast.arg0.value;
					const str = strings[index];
					if (str) {
						comment = str.stringEncode();
					}
					else {
						comment = '?';
					}
					break OUTER;
				}
			}
			for (const Instruction of [
				InstructionBCLGetGameVariable,
				InstructionBCLSetGameVariable,
				InstructionBCLCallGameFunction,
			]) {
				const cast = typed.cast(instruction, Instruction);
				if (!cast) {
					continue;
				}
				const indexNS = cast.arg0.value;
				const indexName = cast.arg1.value;
				const info = ['?', '?'];

				const stringNS = strings[indexNS];
				if (stringNS) {
					info[0] = stringNS.stringEncode();
				}
				const stringName = strings[indexName];
				if (stringName) {
					info[1] = stringName.stringEncode();
				}
				comment = info.join('.');

				break OUTER;
			}

			// Mark variables as global or local.
			for (const Instruction of [
				InstructionBCLGetVariableValue,
				InstructionBCLSetVariableValue
			]) {
				const cast = typed.cast(instruction, Instruction);
				if (!cast) {
					continue;
				}
				const index = cast.arg0.value;
				// tslint:disable-next-line: no-bitwise
				if (index & 0x8000) {
					comment = 'global';

					// tslint:disable-next-line: no-bitwise
					const nameIndex = index ^ 0x8000;
					const globalName = globals[nameIndex];
					if (globalName) {
						comment += ' ' + globalName.stringEncode();
					}
					else {
						comment += ' ?';
					}
				}
				else {
					comment = 'local';
				}
				break OUTER;
			}

			// Add newline after branchers.
			for (const Instruction of [
				InstructionAbstractCompareAndBranchIfFalseBranchTarget,
				InstructionAbstractBranchAlwaysBranchTarget,
			]) {
				const cast = typed.cast(instruction, Instruction);
				if (!cast) {
					continue;
				}
				// If the instruction includes an offset add warning.
				if (cast.arg1.value) {
					comment = 'WARNING: Offset from target';
				}
				jumpedFrom = true;
				break OUTER;
			}
			for (const Instruction of [
				InstructionBCLCompareAndBranchIfFalse,
				InstructionBCLBranchAlways
			]) {
				const cast = typed.cast(instruction, Instruction);
				if (!cast) {
					continue;
				}
				jumpedFrom = true;
				break OUTER;
			}

			// Add newline before targets.
			for (const Instruction of [
				InstructionAbstractBranchTarget
			]) {
				const cast = typed.cast(instruction, Instruction);
				if (!cast) {
					continue;
				}
				jumpedTo = true;
				break OUTER;
			}

			// Add a warning comment for an unexpected instructions.
			for (const Instruction of [
				InstructionBCLCallGameFunctionDirect
			]) {
				const cast = typed.cast(instruction, Instruction);
				if (!cast) {
					continue;
				}
				comment = 'WARNING: Unexpected instruction';
				break OUTER;
			}
		}
		// tslint:disable-next-line: no-constant-condition
		while (false);

		if (jumpedTo) {
			const line = new ASTNodeStatementLine();
			this._disassembleSetComment(line.comment, '<-');
			r.push(line);
		}

		this._disassembleSetComment(ast.comment, comment);
		r.push(ast);

		if (jumpedFrom) {
			const line = new ASTNodeStatementLine();
			this._disassembleSetComment(line.comment, '->');
			r.push(line);
		}

		return r;
	}

	/**
	 * Arguments AST from instruction.
	 *
	 * @param osi OSI instance.
	 * @param instruction Instruction.
	 * @return AST arguments.
	 */
	public disassembleInstructionArguments(
		osi: OSI,
		instruction: Instruction
	): ASTNodeArgument[] {
		const r: ASTNodeArgument[] = [];
		for (let i = 0; i < instruction.argc; i++) {
			const arg = instruction.argGet(i);
			r.push(
				this.disassembleInstructionArgument(
					osi,
					arg,
					i,
					instruction
				)
			);
		}
		return r;
	}

	/**
	 * Argument AST from instruction and argument.
	 *
	 * @param osi OSI instance.
	 * @param argument Instruction argument.
	 * @param argumentIndex Instruction argument index.
	 * @param instruction Instruction.
	 * @return AST argument.
	 */
	public disassembleInstructionArgument(
		osi: OSI,
		argument: Primitive,
		argumentIndex: number,
		instruction: Instruction
	): ASTNodeArgument {
		const int = typed.cast(argument, PrimitiveInt);
		if (int) {
			let base = 10;

			// Change base for some instruction types.
			// Perhaps make this extendable.
			if (
				argumentIndex === 0 &&
				(
					typed.cast(
						instruction,
						InstructionBCLPushConstantColor8888
					) ||
					typed.cast(
						instruction,
						InstructionBCLPushConstantColor5551
					)
				)
			) {
				base = 16;
			}

			return this._disassembleCreateArgumentFromInt(int, base);
		}

		const float = typed.cast(argument, PrimitiveFloat);
		if (float) {
			return this._disassembleCreateArgumentFromFloat(float);
		}

		const str = typed.cast(argument, PrimitiveString);
		if (str) {
			return this._disassembleCreateArgumentFromString(str);
		}

		// Should never get here.
		throw new ExceptionInternal('Unhandled instruction argument type');
	}

	/**
	 * Map subroutine offsets to incremental IDs.
	 *
	 * @param osi OSI instance.
	 * @return Map object.
	 */
	protected _disassembleMapSubroutineOffsetToId(
		osi: OSI
	): MapSubroutineOffsetToId {
		// Create subroutine offset to ID mappings.
		const r: MapSubroutineOffsetToId = new Map();
		let subroutineID = 0;
		for (const {offset} of osi.subroutines.itter()) {
			const off = offset.value;
			if (r.has(subroutineID)) {
				throw new ExceptionInvalid(`Duplicate offset: ${off}`);
			}
			r.set(off, subroutineID);
			subroutineID++;
		}
		return r;
	}

	/**
	 * Map function offsets to function definitions.
	 *
	 * @param osi OSI instance.
	 * @return Map object.
	 */
	protected _disassembleMapFunctionOffsetToDefinitions(
		osi: OSI
	): MapFunctionOffsetToDefinitions {
		// Create subroutine offset to function mappings.
		const r: MapFunctionOffsetToDefinitions = new Map();
		for (const func of osi.header.functionTable.entries) {
			const off = func.offset.value;
			const list = r.get(off) || [];
			list.push(func);
			r.set(off, list);
		}
		return r;
	}

	/**
	 * Map class method offsets to class definitions.
	 *
	 * @param osi OSI instance.
	 * @return Map object.
	 */
	protected _disassembleMapClassMethodOffsetToDefinitions(
		osi: OSI
	): MapClassMethodOffsetToDefinitions {
		// Create subroutine offset to class and method mappings.
		const r: MapClassMethodOffsetToDefinitions =
			new Map();
		for (const classInfo of osi.header.classTable.entries) {
			const structure = classInfo.structure;
			for (const method of structure.classMethodTable.entries) {
				const off = method.offset.value;
				const list = r.get(off) || [];
				list.push({classInfo, method});
				r.set(off, list);
			}
		}
		return r;
	}

	/**
	 * Create argument number from primitive int.
	 *
	 * @param value Primitive int.
	 * @return AST argument.
	 */
	protected _disassembleCreateArgumentFromInt(
		value: PrimitiveInt,
		base = 10
	) {
		const ast = new ASTNodeArgumentNumber();
		ast.text = value.stringEncode(base);
		return ast;
	}

	/**
	 * Create argument number from primitive float.
	 *
	 * @param value Primitive float.
	 * @return AST argument.
	 */
	protected _disassembleCreateArgumentFromFloat(
		value: PrimitiveFloat
	) {
		const ast = new ASTNodeArgumentNumber();
		ast.text = value.stringEncode();
		return ast;
	}

	/**
	 * Create argument number from regular number primitive.
	 *
	 * @param value Number primitive.
	 * @return AST argument.
	 */
	protected _disassembleCreateArgumentFromNumber(
		value: number
	) {
		const ast = new ASTNodeArgumentNumber();
		ast.text = value.toString();
		return ast;
	}

	/**
	 * Create argument string from primitive string.
	 *
	 * @param value Primitive string.
	 * @return AST argument.
	 */
	protected _disassembleCreateArgumentFromString(
		value: PrimitiveString
	) {
		const ast = new ASTNodeArgumentString();
		ast.text = value.stringEncode();
		return ast;
	}

	/**
	 * Set comment from text.
	 *
	 * @param comment Comment node.
	 * @param str Comment body.
	 */
	protected _disassembleSetComment(
		comment: ASTNodeComment,
		str: string
	) {
		comment.text = str ? `; ${str}` : '';
	}

	/**
	 * Create AST statement line.
	 *
	 * @return New instance.
	 */
	protected _disassembleCreateStatementLine() {
		return new ASTNodeStatementLine();
	}

	/**
	 * Create AST statement block.
	 *
	 * @param id Identifier string.
	 * @return New instance.
	 */
	protected _disassembleCreateStatementBlock(id: string) {
		const ast = new ASTNodeStatementBlock();
		ast.begin.identifier.text = id;
		this._disassembleSetComment(ast.end.comment, id);
		return ast;
	}

	/**
	 * Create AST statement instruction.
	 *
	 * @param id Identifier string.
	 * @return New instance.
	 */
	protected _disassembleCreateStatementInstruction(id: string) {
		const ast = new ASTNodeStatementInstruction();
		ast.identifier.text = id;
		return ast;
	}
}
