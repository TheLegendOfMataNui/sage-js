import {PrimitiveStringP8N} from '@sage-js/core';
import {
	OSI,
	FunctionDefinition,
	ClassDefinition,
	ClassDefinitionMethod
} from '@sage-js/res-osi';
import {ExceptionInvalid} from '../../exception/invalid';
import {SymbolToIndex} from '../../types';
import {ASTNodeFile} from '../../ast/node/file';
import {ASTNodeStatementBlock} from '../../ast/node/statement/block';
import {AssemblyAssembler} from './class';

/**
 * AssemblyAssemblerStructured constructor.
 */
export class AssemblyAssemblerStructured extends AssemblyAssembler {
	constructor() {
		super();
	}

	/**
	 * Assemble AST to OSI.
	 *
	 * @param ast AST file.
	 * @return OSI instance.
	 */
	public assemble(ast: ASTNodeFile) {
		return this.assembles([ast]);
	}

	/**
	 * Assemble AST to OSI.
	 *
	 * @param ast AST file.
	 * @return OSI instance.
	 */
	public assembles(asts: ASTNodeFile[]) {
		const osi = new OSI();

		const rootAST = asts.length === 1 ? asts[0] : null;

		// Sort top level statements.
		const {
			blocks,
			instructions
		} = this._assembleGroupStatementsList(asts.map(ast => ast.statements));
		this._assembleAssertNoInstructions(instructions);

		// Sort blocks by identifier.
		const blocksByID = this._assembleIdentifierMappedBlocks(blocks);

		// Read the expected ones.
		const blockMetadata =
			this._assembleIdentifierMappedBlocksConsumeOne(
				blocksByID,
				'metadata',
				rootAST
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
		const blocksFunctions = this._assembleIdentifierMappedBlocksConsume(
			blocksByID,
			'function'
		);
		const blocksClasses = this._assembleIdentifierMappedBlocksConsume(
			blocksByID,
			'class'
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

		// Assemble all functions, classes, and subroutines.
		this.assembleStructuredFunctions(blocksFunctions, osi);
		this.assembleStructuredClasses(blocksClasses, osi);
		this.assembleStructuredSubroutines(blocksSubroutines, osi);

		// Update offsets to their real values.
		osi.updateOffsets();

		return osi;
	}

	/**
	 * Assemble structured function AST blocks into OSI.
	 *
	 * @param asts AST blocks.
	 * @param osi OSI instance.
	 */
	public assembleStructuredFunctions(
		asts: ASTNodeStatementBlock[],
		osi: OSI
	) {
		osi.header.functionTable.entries = [];
		for (const ast of asts) {
			this.assembleStructuredFunction(ast, osi);
		}
	}

	/**
	 * Assemble structured function AST block into table.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 */
	public assembleStructuredFunction(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 2);
		const definition = new FunctionDefinition();

		definition.name = this._assembleDecodeArgument(
			definition.name,
			ast.begin.arguments.entries[0]
		);
		definition.argc = this._assembleDecodeArgument(
			definition.argc,
			ast.begin.arguments.entries[1]
		);

		// Assemble body into subroutine, remember the temporary offset.
		definition.offset = this.assembleSubroutineBody(ast, osi);

		osi.header.functionTable.entries.push(definition);
	}

	/**
	 * Assemble structured class AST blocks into OSI.
	 *
	 * @param asts AST blocks.
	 * @param osi OSI instance.
	 */
	public assembleStructuredClasses(
		asts: ASTNodeStatementBlock[],
		osi: OSI
	) {
		// Mappings for class extending.
		const nameToStructure = new Map<string, ClassDefinition>();
		const structureToExtends =
			new Map<ClassDefinition, PrimitiveStringP8N>();

		// Function to get or add an existing symbol.
		const symbolToIndex = this._assembleSymbolToIndex(osi);

		// Disassemble classes.
		osi.header.classTable.entries = [];
		for (const ast of asts) {
			const {
				extend,
				name,
				structure
			} = this.assembleStructuredClass(ast, osi, symbolToIndex);

			// Check unique, then add to map.
			const existing = nameToStructure.get(name.value) || null;
			if (existing) {
				const s = name.stringEncode();
				throw new ExceptionInvalid(`Class name not unique: ${s}`);
			}
			nameToStructure.set(name.value, structure);

			// If extending another class, remember which for later.
			if (extend) {
				structureToExtends.set(structure, extend);
			}
		}

		// Populate the extends data once all classes exist.
		for (const [structure, extend] of structureToExtends) {
			const extending = nameToStructure.get(extend.value) || null;
			if (!extending) {
				const s = extend.stringEncode();
				throw new ExceptionInvalid(`Class name unknown: ${s}`);
			}
			structure.extends = extending;
		}
	}

	/**
	 * Assemble structured class AST block into table.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 * @param symbolToIndex Get symbol or add.
	 */
	public assembleStructuredClass(
		ast: ASTNodeStatementBlock,
		osi: OSI,
		symbolToIndex: SymbolToIndex
	) {
		this._assembleAssertArgumentCountRange(ast.begin.arguments, 1, 2);
		const {
			blocks,
			instructions
		} = this._assembleGroupStatements(ast.statements);

		const instructionsByID =
			this._assembleIdentifierMappedInstructions(instructions);
		const blocksByID =
			this._assembleIdentifierMappedBlocks(blocks);

		const instructionProperties =
			this._assembleIdentifierMappedInstructionsConsume(
				instructionsByID,
				'property'
			);
		const blockMethods =
			this._assembleIdentifierMappedBlocksConsume(
				blocksByID,
				'method'
			);

		this._assembleAssertInstructionByIdentifierEmpty(instructionsByID);
		this._assembleAssertBlockByIdentifierEmpty(blocksByID);

		const structure = new osi.header.classTable.ClassDefinition();
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
		for (const block of blockMethods) {
			this.assembleStructuredClassMethod(
				block,
				osi,
				structure,
				symbolToIndex
			);
		}

		osi.header.classTable.entries.push({
			name,
			structure
		});

		let extend: PrimitiveStringP8N | null = null;
		if (ast.begin.arguments.entries.length > 1) {
			extend = this._assembleDecodeArgument(
				new PrimitiveStringP8N(),
				ast.begin.arguments.entries[1]
			);
		}

		return {
			extend,
			name,
			structure
		};
	}

	/**
	 * Assemble structured class method AST block into definition.
	 *
	 * @param ast AST block.
	 * @param classDefinition Definition instance.
	 * @param idToOffset Maps ID to offset.
	 * @param symbolToIndex Get symbol or add.
	 */
	public assembleStructuredClassMethod(
		ast: ASTNodeStatementBlock,
		osi: OSI,
		classDefinition: ClassDefinition,
		symbolToIndex: SymbolToIndex
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 1);

		const method = new ClassDefinitionMethod();

		const argName = ast.begin.arguments.entries[0];
		method.symbol = this._assembleConvertArgumentToSymbol(
			argName,
			symbolToIndex
		);

		// Assemble body into subroutine, remember the temporary offset.
		method.offset = this.assembleSubroutineBody(ast, osi);

		classDefinition.classMethodTable.entries.push(method);
	}

	/**
	 * Assemble structured subroutine AST blocks into OSI.
	 *
	 * @param asts AST blocks.
	 * @param osi OSI instance.
	 */
	public assembleStructuredSubroutines(
		asts: ASTNodeStatementBlock[],
		osi: OSI
	) {
		for (const ast of asts) {
			this.assembleStructuredSubroutine(ast, osi);
		}
	}

	/**
	 * Assemble structured subroutine AST block into table.
	 *
	 * @param ast AST block.
	 * @param osi OSI instance.
	 */
	public assembleStructuredSubroutine(
		ast: ASTNodeStatementBlock,
		osi: OSI
	) {
		this._assembleAssertArgumentCount(ast.begin.arguments, 0);

		// Assemble body into subroutine, discard offset.
		this.assembleSubroutineBody(ast, osi);
	}
}
