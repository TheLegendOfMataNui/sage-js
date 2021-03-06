import {
	Primitive,
	PrimitiveInt,
	PrimitiveInt16U,
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

import {typed} from '../../typed';
import {
	MapIdentifierToASTNodeStatementInstruction,
	MapIdentifierToASTNodeStatementBlock,
	MapIdToSubroutineOffset,
	SymbolToIndex
} from '../../types';
import {ExceptionAST} from '../../exception/ast/class';
import {ExceptionASTNode} from '../../exception/ast/node/class';
import {ASTNode} from '../../ast/node/class';
import {ASTNodeArgument} from '../../ast/node/argument/class';
import {ASTNodeArgumentNumber} from '../../ast/node/argument/number';
import {ASTNodeArgumentString} from '../../ast/node/argument/string';
import {ASTNodeArguments} from '../../ast/node/arguments';
import {ASTNodeFile} from '../../ast/node/file';
import {ASTNodeStatements} from '../../ast/node/statements';
import {ASTNodeStatementLine} from '../../ast/node/statement/line';
import {ASTNodeStatementBlock} from '../../ast/node/statement/block';
import {
	ASTNodeStatementInstruction
} from '../../ast/node/statement/instruction';
import {Assembly} from '../class';

/**
 * AssemblyAssembler constructor.
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
	 * @returns OSI instance.
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

		// Read the optional ones.
		const blockStrings =
			this._assembleIdentifierMappedBlocksConsumeOneOptional(
				blocksByID,
				'strings'
			);
		const blockGlobals =
			this._assembleIdentifierMappedBlocksConsumeOneOptional(
				blocksByID,
				'globals'
			);
		const blockSymbols =
			this._assembleIdentifierMappedBlocksConsumeOneOptional(
				blocksByID,
				'symbols'
			);
		const blockSources =
			this._assembleIdentifierMappedBlocksConsumeOneOptional(
				blocksByID,
				'sources'
			);
		const blockFunctions =
			this._assembleIdentifierMappedBlocksConsumeOneOptional(
				blocksByID,
				'functions'
			);
		const blockClasses =
			this._assembleIdentifierMappedBlocksConsumeOneOptional(
				blocksByID,
				'classes'
			);
		const blocksSubroutines = this._assembleIdentifierMappedBlocksConsume(
			blocksByID,
			'subroutine'
		);

		// Make sure no unexpected blocks remain.
		this._assembleAssertBlockByIdentifierEmpty(blocksByID);

		// Read the metadata to init the OSI.
		this.assembleMetadata(blockMetadata, osi);

		// Assemble the strings tables if present.
		if (blockStrings) {
			this.assembleStrings(blockStrings, osi);
		}
		if (blockGlobals) {
			this.assembleGlobals(blockGlobals, osi);
		}
		if (blockSymbols) {
			this.assembleSymbols(blockSymbols, osi);
		}
		if (blockSources) {
			this.assembleSources(blockSources, osi);
		}

		// Create subroutines with some dummy offsets.
		const idToOffset = new Map() as MapIdToSubroutineOffset;
		this.assembleSubroutines(blocksSubroutines, osi, idToOffset);

		// Create functions and classes using those dummy offsets.
		if (blockFunctions) {
			this.assembleFunctions(blockFunctions, osi, idToOffset);
		}
		if (blockClasses) {
			this.assembleClasses(blockClasses, osi, idToOffset);
		}

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
		osi.header.version = this._assembleDecodeArgument(
			osi.header.version,
			version.arguments.entries[0]
		);
		osi.header.flags = this._assembleDecodeArgument(
			osi.header.flags,
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
	 * @param table String table.
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

		const [,, argIdNode] = ast.arguments.entries;
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

		// Function to get or add an existing symbol.
		const symbolToIndex = this._assembleSymbolToIndex(osi);

		osi.header.classTable.entries = [];
		for (const block of blockClasses) {
			this.assembleClass(
				block,
				osi.header.classTable,
				idToOffset,
				symbolToIndex
			);
		}
	}

	/**
	 * Assemble a class AST block into table.
	 *
	 * @param ast AST block.
	 * @param classDefinitionTable ClassDefinitionTable instance.
	 * @param idToOffset Maps ID to offset.
	 * @param symbolToIndex Get symbol or add.
	 */
	public assembleClass(
		ast: ASTNodeStatementBlock,
		classDefinitionTable: ClassDefinitionTable,
		idToOffset: MapIdToSubroutineOffset,
		symbolToIndex: SymbolToIndex
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
			this.assembleClassProperty(
				instruction,
				structure,
				symbolToIndex
			);
		}
		for (const instruction of instructionMethods) {
			this.assembleClassMethod(
				instruction,
				structure,
				idToOffset,
				symbolToIndex
			);
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
	 * @param symbolToIndex Get symbol or add.
	 */
	public assembleClassProperty(
		ast: ASTNodeStatementInstruction,
		classDefinition: ClassDefinition,
		symbolToIndex: SymbolToIndex
	) {
		this._assembleAssertArgumentCount(ast.arguments, 1);
		const property = new ClassDefinitionProperty();

		const [argName] = ast.arguments.entries;
		property.symbol = this._assembleConvertArgumentToSymbol(
			argName,
			symbolToIndex
		);

		classDefinition.classPropertyTable.entries.push(property);
	}

	/**
	 * Assemble a class method AST instruction into definition.
	 *
	 * @param ast AST instruction.
	 * @param classDefinition Definition instance.
	 * @param idToOffset Maps ID to offset.
	 * @param symbolToIndex Get symbol or add.
	 */
	public assembleClassMethod(
		ast: ASTNodeStatementInstruction,
		classDefinition: ClassDefinition,
		idToOffset: MapIdToSubroutineOffset,
		symbolToIndex: SymbolToIndex
	) {
		this._assembleAssertArgumentCount(ast.arguments, 2);

		const method = new ClassDefinitionMethod();

		const [, argIdNode] = ast.arguments.entries;
		const id = this._assembleDecodeArgumentNumber(argIdNode);
		const offset = idToOffset.get(id);
		if (!offset) {
			throw new ExceptionASTNode(
				`No subroutine with identifier: ${id}`,
				argIdNode
			);
		}

		const [argName] = ast.arguments.entries;
		method.symbol = this._assembleConvertArgumentToSymbol(
			argName,
			symbolToIndex
		);

		method.offset = offset;

		classDefinition.classMethodTable.entries.push(method);
	}

	/**
	 * Assemble subroutines AST blocks into OSI.
	 *
	 * @param asts AST blocks.
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
		const [argIdNode] = ast.begin.arguments.entries;
		const id = this._assembleDecodeArgumentNumber(argIdNode);

		if (idToOffset.has(id)) {
			throw new ExceptionASTNode(
				`Duplicate subroutine identifier: ${id}`,
				argIdNode
			);
		}

		// Assemble body.
		const offset = this.assembleSubroutineBody(ast, osi);

		idToOffset.set(id, offset);
	}

	/**
	 * Assemble subroutine AST statements into OSI.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 * @returns The offset.
	 */
	public assembleSubroutineBody(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);
		this._assembleAssertNoBlocks(blocks);

		if (!instructions.length) {
			throw new ExceptionASTNode(
				'Block has no instructions',
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

		return offset;
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
				`Unknown instruction name: ${name}`,
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
	 * @returns Decoded number.
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
	 * @returns Decoded argument.
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
	 * Groups a list of statements by type, ignoring the empty lines.
	 *
	 * @param asts AST statements list.
	 * @returns The blocks and instructions.
	 */
	protected _assembleGroupStatementsList(asts: ASTNodeStatements[]) {
		const blocks: ASTNodeStatementBlock[] = [];
		const instructions: ASTNodeStatementInstruction[] = [];

		for (const ast of asts) {
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
		}

		return {
			blocks,
			instructions
		};
	}

	/**
	 * Groups statements by type, ignoring the empty lines.
	 *
	 * @param ast AST statements.
	 * @returns The blocks and instructions.
	 */
	protected _assembleGroupStatements(ast: ASTNodeStatements) {
		return this._assembleGroupStatementsList([ast]);
	}

	/**
	 * Map instructions by identifier.
	 *
	 * @param instructions AST instructions.
	 * @returns The map.
	 */
	protected _assembleIdentifierMappedInstructions(
		instructions: ASTNodeStatementInstruction[]
	) {
		const r = new Map() as MapIdentifierToASTNodeStatementInstruction;
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
	 * @returns The map.
	 */
	protected _assembleIdentifierMappedBlocks(
		blocks: ASTNodeStatementBlock[]
	) {
		const r = new Map() as MapIdentifierToASTNodeStatementBlock;
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
	 * @returns The map.
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
	 * @returns The map.
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
	 * Get and remove an instruction from map, throwing if more than one.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 * @returns The instruction or null.
	 */
	protected _assembleIdentifierMappedInstructionsConsumeOneOptional(
		map: MapIdentifierToASTNodeStatementInstruction,
		id: string
	) {
		const list = map.get(id);
		if (!list) {
			return null;
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
	 * Get and remove a block from map, throwing if more than one.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 * @returns The block or null.
	 */
	protected _assembleIdentifierMappedBlocksConsumeOneOptional(
		map: MapIdentifierToASTNodeStatementBlock,
		id: string
	) {
		const list = map.get(id);
		if (!list) {
			return null;
		}
		if (list.length !== 1) {
			throw new ExceptionASTNode(
				`Duplicate block with identifier ${id}`,
				list[1]
			);
		}
		map.delete(id);
		return list[0];
	}

	/**
	 * Get and remove a block from map, throwing if more than one.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 * @param container Container element used for throwing exceptions.
	 * @returns The instruction or null.
	 */
	protected _assembleIdentifierMappedInstructionsConsumeOne(
		map: MapIdentifierToASTNodeStatementInstruction,
		id: string,
		container: ASTNode | null
	) {
		const r = this._assembleIdentifierMappedInstructionsConsumeOneOptional(
			map,
			id
		);
		if (!r) {
			const msg = `No instruction with identifier ${id}`;
			if (container) {
				throw new ExceptionASTNode(msg, container);
			}
			else {
				throw new ExceptionAST(msg);
			}
		}
		return r;
	}

	/**
	 * Get and remove an instruction from map, throwing if more than one.
	 *
	 * @param map Map object.
	 * @param id Identifier string.
	 * @param container Container element used for throwing exceptions.
	 * @returns The block or null.
	 */
	protected _assembleIdentifierMappedBlocksConsumeOne(
		map: MapIdentifierToASTNodeStatementBlock,
		id: string,
		container: ASTNode | null
	) {
		const r = this._assembleIdentifierMappedBlocksConsumeOneOptional(
			map,
			id
		);
		if (!r) {
			const msg = `No block with identifier ${id}`;
			if (container) {
				throw new ExceptionASTNode(msg, container);
			}
			else {
				throw new ExceptionAST(msg);
			}
		}
		return r;
	}

	/**
	 * Assert mapped instructions object is empty.
	 *
	 * @param map Map object.
	 */
	protected _assembleAssertInstructionByIdentifierEmpty(
		map: MapIdentifierToASTNodeStatementInstruction
	) {
		for (const [, entry] of map) {
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
		for (const [, entry] of map) {
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
	 * Assert arguments entry count range.
	 *
	 * @param args Arguments node.
	 * @param min Expected min.
	 * @param max Expected max.
	 */
	protected _assembleAssertArgumentCountRange(
		args: ASTNodeArguments,
		min: number,
		max: number
	) {
		const l = args.entries.length;
		if (l < min) {
			throw new ExceptionASTNode(
				`Too few arguments, expected ${min}-${max} found ${l}`,
				args
			);
		}
		else if (l > max) {
			throw new ExceptionASTNode(
				`Unexpected argument, expected ${min}-${max} found ${l}`,
				args.entries[max]
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

	/**
	 * Convert argument to symbol, adding new if needed.
	 *
	 * @param ast Arg node.
	 * @param symbolToIndex Get symbol or add.
	 * @returns Decoded symbol.
	 */
	protected _assembleConvertArgumentToSymbol(
		ast: ASTNodeArgument,
		symbolToIndex: SymbolToIndex
	) {
		const argString = typed.cast(ast, ASTNodeArgumentString);
		if (argString) {
			const str = this._assembleDecodeArgument(
				new PrimitiveStringP8N(),
				argString
			);
			return symbolToIndex(str);
		}
		return this._assembleDecodeArgument(new PrimitiveInt16U(), ast);
	}

	/**
	 * Symbol index getter, adding if necessary.
	 *
	 * @param osi OSI instance.
	 * @returns Getter function.
	 */
	protected _assembleSymbolToIndex(osi: OSI): SymbolToIndex {
		// Map existing symbol strings to indexes.
		const symbolMap = new Map<string, PrimitiveInt16U>();
		const symbolList = osi.header.symbolTable.entries;
		for (let i = 0; i < symbolList.length; i++) {
			const symbol = symbolList[i];
			symbolMap.set(symbol.value, new PrimitiveInt16U(i));
		}

		// Function to get or add an existing symbol.
		return s => {
			let index = symbolMap.get(s.value);
			if (!index) {
				index = new PrimitiveInt16U(symbolList.length);
				symbolMap.set(s.value, index);
				symbolList.push(s);
			}
			return index;
		};
	}
}
