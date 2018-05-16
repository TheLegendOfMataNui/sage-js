import {
	PrimitiveInt8S,
	PrimitiveInt8U,
	PrimitiveInt16S,
	PrimitiveInt16U,
	PrimitiveInt32S,
	PrimitiveInt32U,
	PrimitiveFloat32,
	PrimitiveFloat64,
	PrimitiveStringP8N
} from '@sage-js/core';
import {ClassDefinition} from './classdefinition/class';
import {Subroutine} from './subroutine';
import {Instruction} from './instruction/class';
import {InstructionBCL} from './instruction/bcl/class';
import {InstructionAbstract} from './instruction/abstract/class';

export type InstructionBCLArgType =
	PrimitiveInt8S |
	PrimitiveInt8U |
	PrimitiveInt16S |
	PrimitiveInt16U |
	PrimitiveInt32S |
	PrimitiveInt32U |
	PrimitiveFloat32 |
	PrimitiveFloat64;

export type InstructionAbstractArgType =
	PrimitiveInt8S |
	PrimitiveInt8U |
	PrimitiveInt16S |
	PrimitiveInt16U |
	PrimitiveInt32S |
	PrimitiveInt32U |
	PrimitiveFloat32 |
	PrimitiveFloat64;

export type InstructionArgType =
	InstructionBCLArgType |
	InstructionAbstractArgType;

export interface IClassDefinitionTableEntry {
	structure: ClassDefinition;
	name: PrimitiveStringP8N;
}

export interface ISubroutineTableEntry {
	offset: PrimitiveInt32U;
	subroutine: Subroutine;
}

export type SubroutineTableEntryEach =
	(data: ISubroutineTableEntry) => void;

export type MapInstructionBCLByOpcode =
	Map<number, new() => InstructionBCL>;

export type MapInstructionBCLByName =
	Map<string, new() => InstructionBCL>;

export type MapInstructionAbstractByName =
	Map<string, new() => InstructionAbstract>;

export type MapInstructionByName =
	Map<string, new() => Instruction>;
