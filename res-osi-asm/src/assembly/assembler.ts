import {
	Primitive,
	PrimitiveInt,
	PrimitiveInt32U,
	PrimitiveFloat,
	PrimitiveString,
	PrimitiveStringP8N,
	utilStringToNumber
} from '@sage-js/core';
import {
	OSI,
	StringP8NTable,
	Subroutine,
	Instruction,
	instructionByName,
	FunctionDefinition,
	FunctionDefinitionTable,
	ClassDefinition,
	ClassDefinitionTable,
	ClassDefinitionProperty,
	ClassDefinitionMethod
} from '@sage-js/res-osi';
import {typed} from '../typed';
import {
	MapIdentifierToASTNodeStatementInstruction,
	MapIdentifierToASTNodeStatementBlock,
	MapIdToSubroutineOffset
} from '../types';
import {ExceptionASTNode} from '../exception/ast/node/class';
import {ASTNode} from '../ast/node/class';
import {ASTNodeArgument} from '../ast/node/argument/class';
import {ASTNodeArgumentNumber} from '../ast/node/argument/number';
import {ASTNodeArgumentString} from '../ast/node/argument/string';
import {ASTNodeArguments} from '../ast/node/arguments';
import {ASTNodeFile} from '../ast/node/file';
import {ASTNodeStatements} from '../ast/node/statements';
import {ASTNodeStatementLine} from '../ast/node/statement/line';
import {ASTNodeStatementBlock} from '../ast/node/statement/block';
import {ASTNodeStatementInstruction} from '../ast/node/statement/instruction';
import {Assembly} from './class';

/**
 * AssemblyDisassembler constructor.
 */
export class AssemblyAssembler extends Assembly {

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
	 * Assemble AST to OSI.
	 *
	 * @param ast AST file.
	 * @return OSI instance.
	 */
	public assemble(ast: ASTNodeFile) {
		const osi = new OSI();

		// Sort top level statements.
		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoInstructions(instructions);

		// Sort blocks by identifier.
		const blocksByID = this._assembleIdentifierMappedBlocks(blocks);

		// Read the expected ones.
		const blockMetadata = this._assembleIdentifierMappedBlocksConsumeOne(
			blocksByID,
			'metadata',
			ast
		);
		const blockStrings = this._assembleIdentifierMappedBlocksConsumeOne(
			blocksByID,
			'strings',
			ast
		);
		const blockGlobals = this._assembleIdentifierMappedBlocksConsumeOne(
			blocksByID,
			'globals',
			ast
		);
		const blockSymbols = this._assembleIdentifierMappedBlocksConsumeOne(
			blocksByID,
			'symbols',
			ast
		);
		const blockSources = this._assembleIdentifierMappedBlocksConsumeOne(
			blocksByID,
			'sources',
			ast
		);
		const blockFunctions = this._assembleIdentifierMappedBlocksConsumeOne(
			blocksByID,
			'functions',
			ast
		);
		const blockClasses = this._assembleIdentifierMappedBlocksConsumeOne(
			blocksByID,
			'classes',
			ast
		);
		const blocksSubroutines = this._assembleIdentifierMappedBlocksConsume(
			blocksByID,
			'subroutine'
		);

		// Make sure no unexpected blocks remain.
		this._assembleAssertBlockByIdentifierEmpty(blocksByID);

		// Read the metadata to init the OSI.
		this.assembleMetadata(blockMetadata, osi);

		// Assemble the strings tables.
		this.assembleStrings(blockStrings, osi);
		this.assembleGlobals(blockGlobals, osi);
		this.assembleSymbols(blockSymbols, osi);
		this.assembleSources(blockSources, osi);

		// Create subroutines with some dummy offsets.
		const idToOffset: MapIdToSubroutineOffset = new Map();
		this.assembleSubroutines(blocksSubroutines, osi, idToOffset);

		// Create functions and classes using those dummy offsets.
		this.assembleFunctions(blockFunctions, osi, idToOffset);
		this.assembleClasses(blockClasses, osi, idToOffset);

		// Update offsets to their real values.
		osi.updateOffsets();

		return osi;
	}

	/**
	 * Assemble metadata AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 */
	public assembleMetadata(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 0);

		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoBlocks(blocks);

		const instructionsById =
			this._assembleIdentifierMappedInstructions(instructions);

		const version = this._assembleIdentifierMappedInstructionsConsumeOne(
			instructionsById,
			'version',
			ast
		);

		this._assembleAssertInstructionByIdentifierEmpty(instructionsById);

		this._assembleAssertArgumentCount(version.arguments, 2);
		osi.header.versionMajor = this._assembleDecodeArgument(
			osi.header.versionMajor,
			version.arguments.entries[0]
		);
		osi.header.versionMinor = this._assembleDecodeArgument(
			osi.header.versionMinor,
			version.arguments.entries[1]
		);

		osi.header.initVersion();
	}

	/**
	 * Assemble string AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 */
	public assembleStrings(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		this.assembleStringP8NTable(
			ast,
			osi.header.stringTable,
			'strings',
			'string'
		);
	}

	/**
	 * Assemble globals AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 */
	public assembleGlobals(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		this.assembleStringP8NTable(
			ast,
			osi.header.globalTable,
			'globals',
			'global'
		);
	}

	/**
	 * Assemble symbols AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 */
	public assembleSymbols(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		this.assembleStringP8NTable(
			ast,
			osi.header.symbolTable,
			'symbols',
			'symbol'
		);
	}

	/**
	 * Assemble sources AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 */
	public assembleSources(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		this.assembleStringP8NTable(
			ast,
			osi.header.sourceTable,
			'sources',
			'source'
		);
	}

	/**
	 * Assemble a generic string AST block into table.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 * @param blockID Block ID.
	 * @param instructionID Instruction ID.
	 */
	public assembleStringP8NTable(
		ast: ASTNodeStatementBlock,
		table: StringP8NTable,
		blockID: string,
		instructionID: string
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 0);

		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoBlocks(blocks);

		const instructionsById = this._assembleIdentifierMappedInstructions(
			instructions
		);

		const strings = this._assembleIdentifierMappedInstructionsConsume(
			instructionsById,
			instructionID
		);

		this._assembleAssertInstructionByIdentifierEmpty(instructionsById);

		table.entries = [];
		for (const str of strings) {
			this.assembleStringP8NTableEntry(
				str,
				table,
				instructionID
			);
		}
	}

	/**
	 * Assemble a generic string AST instruction into table.
	 *
	 * @param ast AST instruction.
	 * @param table StringP8NTable instance.
	 * @param instructionID Instruction ID.
	 */
	public assembleStringP8NTableEntry(
		ast: ASTNodeStatementInstruction,
		table: StringP8NTable,
		instructionID: string
	) {
		this._assembleAssertArgumentCount(ast.arguments, 1);
		table.entries.push(this._assembleDecodeArgument(
			new PrimitiveStringP8N(),
			ast.arguments.entries[0]
		));
	}

	/**
	 * Assemble a functions AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 * @param idToOffset Maps ID to offset.
	 */
	public assembleFunctions(
		ast: ASTNodeStatementBlock,
		osi: OSI,
		idToOffset: MapIdToSubroutineOffset
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 0);
		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoBlocks(blocks);

		const instructionsByID =
			this._assembleIdentifierMappedInstructions(instructions);
		const instructionFunctions =
			this._assembleIdentifierMappedInstructionsConsume(
				instructionsByID,
				'function'
			);
		this._assembleAssertInstructionByIdentifierEmpty(instructionsByID);

		osi.header.functionTable.entries = [];
		for (const instruction of instructionFunctions) {
			this.assembleFunction(
				instruction,
				osi.header.functionTable,
				idToOffset
			);
		}
	}

	/**
	 * Assemble a function AST instruction into table.
	 *
	 * @param ast AST instruction.
	 * @param functionDefinitionTable FunctionDefinitionTable instance.
	 * @param idToOffset Maps ID to offset.
	 */
	public assembleFunction(
		ast: ASTNodeStatementInstruction,
		functionDefinitionTable: FunctionDefinitionTable,
		idToOffset: MapIdToSubroutineOffset
	) {
		this._assembleAssertArgumentCount(ast.arguments, 3);
		const definition = new FunctionDefinition();

		const argIdNode = ast.arguments.entries[2];
		const id = this._assembleDecodeArgumentNumber(argIdNode);
		const offset = idToOffset.get(id);
		if (!offset) {
			throw new ExceptionASTNode(
				`No subroutine with identifier: ${id}`,
				argIdNode
			);
		}

		definition.name = this._assembleDecodeArgument(
			definition.name,
			ast.arguments.entries[0]
		);
		definition.argc = this._assembleDecodeArgument(
			definition.argc,
			ast.arguments.entries[1]
		);
		definition.offset = offset;

		functionDefinitionTable.entries.push(definition);
	}

	/**
	 * Assemble a classes AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 * @param idToOffset Maps ID to offset.
	 */
	public assembleClasses(
		ast: ASTNodeStatementBlock,
		osi: OSI,
		idToOffset: MapIdToSubroutineOffset
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 0);
		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoInstructions(instructions);

		const blocksByID = this._assembleIdentifierMappedBlocks(blocks);
		const blockClasses = this._assembleIdentifierMappedBlocksConsume(
			blocksByID,
			'class'
		);
		this._assembleAssertBlockByIdentifierEmpty(blocksByID);

		osi.header.classTable.entries = [];
		for (const block of blockClasses) {
			this.assembleClass(block, osi.header.classTable, idToOffset);
		}
	}

	/**
	 * Assemble a class AST block into table.
	 *
	 * @param ast AST block.
	 * @param classDefinitionTable ClassDefinitionTable instance.
	 * @param idToOffset Maps ID to offset.
	 */
	public assembleClass(
		ast: ASTNodeStatementBlock,
		classDefinitionTable: ClassDefinitionTable,
		idToOffset: MapIdToSubroutineOffset
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 1);
		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoBlocks(blocks);

		const instructionsByID =
			this._assembleIdentifierMappedInstructions(instructions);
		const instructionProperties =
			this._assembleIdentifierMappedInstructionsConsume(
				instructionsByID,
				'property'
			);
		const instructionMethods =
			this._assembleIdentifierMappedInstructionsConsume(
				instructionsByID,
				'method'
			);
		this._assembleAssertInstructionByIdentifierEmpty(instructionsByID);

		const structure = new classDefinitionTable.ClassDefinition();

		const name = this._assembleDecodeArgument(
			new PrimitiveStringP8N(),
			ast.begin.arguments.entries[0]
		);

		for (const instruction of instructionProperties) {
			this.assembleClassProperty(instruction, structure);
		}
		for (const instruction of instructionMethods) {
			this.assembleClassMethod(instruction, structure, idToOffset);
		}

		classDefinitionTable.entries.push({
			name,
			structure
		});
	}

	/**
	 * Assemble a class property AST instruction into definition.
	 *
	 * @param ast AST instruction.
	 * @param classDefinition Definition instance.
	 */
	public assembleClassProperty(
		ast: ASTNodeStatementInstruction,
		classDefinition: ClassDefinition
	) {
		this._assembleAssertArgumentCount(ast.arguments, 1);
		const property = new ClassDefinitionProperty();
		property.symbol = this._assembleDecodeArgument(
			property.symbol,
			ast.arguments.entries[0]
		);
		classDefinition.classPropertyTable.entries.push(property);
	}

	/**
	 * Assemble a class method AST instruction into definition.
	 *
	 * @param ast AST instruction.
	 * @param classDefinition Definition instance.
	 * @param idToOffset Maps ID to offset.
	 */
	public assembleClassMethod(
		ast: ASTNodeStatementInstruction,
		classDefinition: ClassDefinition,
		idToOffset: MapIdToSubroutineOffset
	) {
		this._assembleAssertArgumentCount(ast.arguments, 2);

		const argIdNode = ast.arguments.entries[1];
		const id = this._assembleDecodeArgumentNumber(argIdNode);
		const offset = idToOffset.get(id);
		if (!offset) {
			throw new ExceptionASTNode(
				`No subroutine with identifier: ${id}`,
				argIdNode
			);
		}

		const method = new ClassDefinitionMethod();
		method.symbol = this._assembleDecodeArgument(
			method.symbol,
			ast.arguments.entries[0]
		);
		method.offset = offset;

		classDefinition.classMethodTable.entries.push(method);
	}

	/**
	 * Assemble subroutines AST blocks into OSI.
	 *
	 * @param ast AST blocks.
	 * @param osi OSI instance.
	 * @param idToOffset Maps ID to offset.
	 */
	public assembleSubroutines(
		asts: ASTNodeStatementBlock[],
		osi: OSI,
		idToOffset: MapIdToSubroutineOffset
	) {
		osi.subroutines.clear();
		osi.subroutines.updateOffsets(new PrimitiveInt32U(0));

		for (const block of asts) {
			this.assembleSubroutine(block, osi, idToOffset);
		}
	}

	/**
	 * Assemble subroutine AST block into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 * @param idToOffset Maps ID to offset.
	 */
	public assembleSubroutine(
		ast: ASTNodeStatementBlock,
		osi: OSI,
		idToOffset: MapIdToSubroutineOffset
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 1);
		const argIdNode = ast.begin.arguments.entries[0];
		const id = this._assembleDecodeArgumentNumber(argIdNode);

		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoBlocks(blocks);
		if (!instructions.length) {
			throw new ExceptionASTNode(
				'Subroutine has no instructions',
				ast
			);
		}

		const {
			offset,
			subroutine
		} = osi.subroutines.addNew();
		for (const instruction of instructions) {
			this.assembleInstruction(instruction, subroutine);
		}

		if (idToOffset.has(id)) {
			throw new ExceptionASTNode(
				`Duplicate subroutine identifier: ${id}`,
				argIdNode
			);
		}
		idToOffset.set(id, offset);
	}

	/**
	 * Assemble instruction AST instruction into subroutine.
	 *
	 * @param ast AST instruction.
	 * @param subroutine Subroutine instance.
	 */
	public assembleInstruction(
		ast: ASTNodeStatementInstruction,
		subroutine: Subroutine
	) {
		const name = ast.identifier.text;
		const Instruction = instructionByName(name);
		if (!Instruction) {
			throw new ExceptionASTNode(
				'Argument is not a number',
				ast
			);
		}
		const instruction = new Instruction();
		this.assembleInstructionArguments(ast, instruction);
		subroutine.instructions.push(instruction);
	}

	/**
	 * Assemble arguments AST into instruction.
	 *
	 * @param ast AST instruction.
	 * @param instruction Instruction instance.
	 */
	public assembleInstructionArguments(
		ast: ASTNodeStatementInstruction,
		instruction: Instruction
	) {
		this._assembleAssertArgumentCount(ast.arguments, instruction.argc);
		for (let i = 0; i < instruction.argc; i++) {
			this.assembleInstructionArgument(ast, instruction, i);
		}
	}

	/**
	 * Assemble argument AST into instruction.
	 *
	 * @param ast AST instruction.
	 * @param instruction Instruction instance.
	 * @param index Argument index.
	 */
	public assembleInstructionArgument(
		ast: ASTNodeStatementInstruction,
		instruction: Instruction,
		index: number
	) {
		const iArg = instruction.argGet(index);
		const aArg = ast.arguments.entries[index];
		const iArgNew = this._assembleDecodeArgument(iArg, aArg);
		instruction.argSet(index, iArgNew);
	}

	/**
	 * Decode argument AST into a number.
	 *
	 * @param argument AST argument.
	 */
	protected _assembleDecodeArgumentNumber(argument: ASTNodeArgument) {
		if (!typed.cast(argument, ASTNodeArgumentNumber)) {
			throw new ExceptionASTNode(
				'Argument is not a number',
				argument
			);
		}

		try {
			return utilStringToNumber(argument.text);
		}
		catch (err) {
			const msg = err.message || '';
			throw new ExceptionASTNode(
				`Invalid identifier argument: ${msg}`,
				argument
			);
		}
	}

	/**
	 * Decode argument AST into a primitive.
	 *
	 * @param primitive Primitive object to decode new of.
	 * @param argument AST argument.
	 */
	protected _assembleDecodeArgument<
		T extends Primitive
	>(
		primitive: T,
		argument: ASTNodeArgument
	): T {
		if (typed.cast(primitive, PrimitiveInt)) {
			if (!typed.cast(argument, ASTNodeArgumentNumber)) {
				throw new ExceptionASTNode(
					'Argument is not a number',
					argument
				);
			}

			try {
				return primitive.stringDecodeNew(argument.text);
			}
			catch (err) {
				const msg = err.message || '';
				throw new ExceptionASTNode(
					`Invalid integer argument: ${msg}`,
					argument
				);
			}
		}
		else if (typed.cast(primitive, PrimitiveFloat)) {
			if (!typed.cast(argument, ASTNodeArgumentNumber)) {
				throw new ExceptionASTNode(
					'Argument is not a number',
					argument
				);
			}

			try {
				return primitive.stringDecodeNew(argument.text);
			}
			catch (err) {
				const msg = err.message || '';
				throw new ExceptionASTNode(
					`Invalid float argument: ${msg}`,
					argument
				);
			}
		}
		else if (typed.cast(primitive, PrimitiveString)) {
			if (!typed.cast(argument, ASTNodeArgumentString)) {
				throw new ExceptionASTNode(
					'Argument is not a string',
					argument
				);
			}

			try {
				return primitive.stringDecodeNew(argument.text);
			}
			catch (err) {
				const msg = err.message || '';
				throw new ExceptionASTNode(
					`Invalid string argument: ${msg}`,
					argument
				);
			}
		}

		throw new ExceptionASTNode(
			'Unknown argument type',
			argument
		);
	}

	/**
	 * Groups statements by type, ignoring the empty lines.
	 *
	 * @param ast AST statements.
	 */
	protected _assembleGroupStatements(ast: ASTNodeStatements) {
		const blocks: ASTNodeStatementBlock[] = [];
		const instructions: ASTNodeStatementInstruction[] = [];

		for (const statement of ast.entries) {
			const line = typed.cast(statement, ASTNodeStatementLine);
			if (line) {
				continue;
			}

			const block = typed.cast(statement, ASTNodeStatementBlock);
			if (block) {
				blocks.push(block);
				continue;
			}

			const instruction =
				typed.cast(statement, ASTNodeStatementInstruction);
			if (instruction) {
				instructions.push(instruction);
				continue;
			}

			throw new ExceptionASTNode(
				'Unknown statement type',
				statement
			);
		}

		return {
			blocks,
			instructions
		};
	}

	/**
	 * Map instructions by identifier.
	 *
	 * @param instructions AST instructions.
	 */
	protected _assembleIdentifierMappedInstructions(
		instructions: ASTNodeStatementInstruction[]
	) {
		const r: MapIdentifierToASTNodeStatementInstruction = new Map();
		for (const instruction of instructions) {
			const id = instruction.identifier.text;
			const list = r.get(id) || [];
			list.push(instruction);
			r.set(id, list);
		}
		return r;
	}

	/**
	 * Map blocks by identifier.
	 *
	 * @param blocks AST blocks.
	 */
	protected _assembleIdentifierMappedBlocks(
		blocks: ASTNodeStatementBlock[]
	) {
		const r: MapIdentifierToASTNodeStatementBlock = new Map();
		for (const block of blocks) {
			const id = block.begin.identifier.text;
			const list = r.get(id) || [];
			list.push(block);
			r.set(id, list);
		}
		return r;
	}

	/**
	 * Get and remove instructions from map.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 */
	protected _assembleIdentifierMappedInstructionsConsume(
		map: MapIdentifierToASTNodeStatementInstruction,
		id: string
	) {
		const r = map.get(id) || [];
		map.delete(id);
		return r;
	}

	/**
	 * Get and remove blocks from map.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 */
	protected _assembleIdentifierMappedBlocksConsume(
		map: MapIdentifierToASTNodeStatementBlock,
		id: string
	) {
		const r = map.get(id) || [];
		map.delete(id);
		return r;
	}

	/**
	 * Get and remove a block from map, throwing if more than one.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 * @param container Container element used for throwing exceptions.
	 */
	protected _assembleIdentifierMappedInstructionsConsumeOne(
		map: MapIdentifierToASTNodeStatementInstruction,
		id: string,
		container: ASTNode
	) {
		const list = map.get(id);
		if (!list) {
			throw new ExceptionASTNode(
				`No instruction with identifier ${id}`,
				container
			);
		}
		if (list.length !== 1) {
			throw new ExceptionASTNode(
				`Duplicate instruction with identifier ${id}`,
				list[1]
			);
		}
		map.delete(id);
		return list[0];
	}

	/**
	 * Get and remove an instruction from map, throwing if more than one.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 * @param container Container element used for throwing exceptions.
	 */
	protected _assembleIdentifierMappedBlocksConsumeOne(
		map: MapIdentifierToASTNodeStatementBlock,
		id: string,
		container: ASTNode
	) {
		const list = map.get(id);
		if (!list) {
			throw new ExceptionASTNode(
				`No instruction with identifier ${id}`,
				container
			);
		}
		if (list.length !== 1) {
			throw new ExceptionASTNode(
				`Duplicate instruction with identifier ${id}`,
				list[1]
			);
		}
		map.delete(id);
		return list[0];
	}

	/**
	 * Assert mapped instructions object is empty.
	 *
	 * @param map Map object.
	 */
	protected _assembleAssertInstructionByIdentifierEmpty(
		map: MapIdentifierToASTNodeStatementInstruction
	) {
		// tslint:disable-next-line: no-unused
		for (const [id, entry] of map) {
			throw new ExceptionASTNode(
				'Unexpected instruction',
				entry[0]
			);
		}
	}

	/**
	 * Assert mapped blocks object is empty.
	 *
	 * @param map Map object.
	 */
	protected _assembleAssertBlockByIdentifierEmpty(
		map: MapIdentifierToASTNodeStatementBlock
	) {
		// tslint:disable-next-line: no-unused
		for (const [id, entry] of map) {
			throw new ExceptionASTNode(
				'Unexpected block',
				entry[0]
			);
		}
	}

	/**
	 * Assert arguments entry count.
	 *
	 * @param args Arguments node.
	 * @param count Expected count.
	 */
	protected _assembleAssertArgumentCount(
		args: ASTNodeArguments,
		count: number
	) {
		const l = args.entries.length;
		if (l < count) {
			throw new ExceptionASTNode(
				`Too few arguments, expected ${count} found ${l}`,
				args
			);
		}
		else if (l > count) {
			throw new ExceptionASTNode(
				`Unexpected argument, expected ${count} found ${l}`,
				args.entries[count]
			);
		}
	}

	/**
	 * Assert an empty list of instructions.
	 *
	 * @param asts Instructions list.
	 */
	protected _assembleAssertNoInstructions(
		asts: ASTNodeStatementInstruction[]
	) {
		if (!asts.length) {
			return;
		}
		throw new ExceptionASTNode(
			'Unexpected instruction',
			asts[0]
		);
	}

	/**
	 * Assert an empty list of blocks.
	 *
	 * @param asts Blocks list.
	 */
	protected _assembleAssertNoBlocks(
		asts: ASTNodeStatementBlock[]
	) {
		if (!asts.length) {
			return;
		}
		throw new ExceptionASTNode(
			'Unexpected block',
			asts[0]
		);
	}
}
