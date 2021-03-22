import {
	PrimitiveInt16U,
	PrimitiveInt32U,
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	OSI,
	IClassDefinitionTableEntry,
	ISubroutineTableEntry,
	ClassDefinitionMethod,
	FunctionDefinition,
	ClassDefinition,
	Subroutine
} from '@sage-js/res-osi';

import {ASTNodeStatementBlock} from './ast/node/statement/block';
import {ASTNodeStatementInstruction} from './ast/node/statement/instruction';

export interface IClassDefinitionMethodInfo {

	/**
	 * Class info.
	 */
	classInfo: IClassDefinitionTableEntry;

	/**
	 * Class method.
	 */
	method: ClassDefinitionMethod;
}

export interface IDisassemblyStructuredFileMapper {

	/**
	 * Metadata mapper.
	 */
	metadata(osi: OSI): string;

	/**
	 * Strings mapper.
	 */
	strings(osi: OSI): string;

	/**
	 * Globals mapper.
	 */
	globals(osi: OSI): string;

	/**
	 * Symbols mapper.
	 */
	symbols(osi: OSI): string;

	/**
	 * Sources mapper.
	 */
	sources(osi: OSI): string;

	/**
	 * Function mapper.
	 */
	function(osi: OSI, def: FunctionDefinition, index: number): string;

	/**
	 * Class mapper.
	 */
	class(osi: OSI, def: IClassDefinitionTableEntry, index: number): string;

	/**
	 * Subroutine mapper.
	 */
	subroutine(osi: OSI, def: ISubroutineTableEntry): string;
}

export type MapSubroutineOffsetToId = Map<number, number>;

export type MapFunctionOffsetToDefinitions = Map<number, FunctionDefinition[]>;

export type MapClassMethodOffsetToDefinitions =
	Map<number, IClassDefinitionMethodInfo[]>;

export type MapSourceRange = Map<number, number[]>;

export interface ITokenMeta {

	/**
	 * Type.
	 */
	type: string;

	/**
	 * Column.
	 */
	column: number;

	/**
	 * Token.
	 */
	token: string;
}

export type MapIdentifierToASTNodeStatementInstruction =
	Map<string, ASTNodeStatementInstruction[]>;

export type MapIdentifierToASTNodeStatementBlock =
	Map<string, ASTNodeStatementBlock[]>;

export type MapIdToSubroutineOffset =
	Map<number, PrimitiveInt32U>;

export type SymbolToIndex = (s: PrimitiveStringP8N) => PrimitiveInt16U;

export type MapClassStructuresToNames =
	Map<ClassDefinition, PrimitiveStringP8N>;

export type MapSubroutineReferenceCount = Map<Subroutine, number>;
