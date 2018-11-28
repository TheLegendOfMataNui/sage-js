import {
	OSI
} from '@sage-js/res-osi';
import {ASTNodeFile} from '../../ast/node/file';
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

		// TODO: Continue here:
		console.log(blocksFunctions.length);
		console.log(blocksClasses.length);
		console.log(blocksSubroutines.length);
		console.log(osi.header.versionMajor, osi.header.versionMinor);

		// Update offsets to their real values.
		osi.updateOffsets();

		return osi;
	}
}
