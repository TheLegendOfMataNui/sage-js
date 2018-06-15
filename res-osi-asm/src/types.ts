import {
	PrimitiveInt16U,
	PrimitiveInt32U,
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	IClassDefinitionTableEntry,
	ClassDefinitionMethod,
	FunctionDefinition
} from '@sage-js/res-osi';
import {ASTNodeStatementBlock} from './ast/node/statement/block';
import {ASTNodeStatementInstruction} from './ast/node/statement/instruction';

export interface IClassDefinitionMethodInfo {
	classInfo: IClassDefinitionTableEntry;
	method: ClassDefinitionMethod;
}

export type MapSubroutineOffsetToId = Map<number, number>;

export type MapFunctionOffsetToDefinitions = Map<number, FunctionDefinition[]>;

export type MapClassMethodOffsetToDefinitions = Map<
	number,
	IClassDefinitionMethodInfo[]
>;

export type MapSourceRange = Map<number, number[]>;

export interface ITokenMeta {
	type: string;
	column: number;
	token: string;
}

export type MapIdentifierToASTNodeStatementInstruction =
	Map<string, ASTNodeStatementInstruction[]>;

export type MapIdentifierToASTNodeStatementBlock =
	Map<string, ASTNodeStatementBlock[]>;

export type MapIdToSubroutineOffset =
	Map<number, PrimitiveInt32U>;

export type SymbolToIndex = (s: PrimitiveStringP8N) => PrimitiveInt16U;
