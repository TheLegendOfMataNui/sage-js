import {
	PrimitiveInt32U,
	PrimitiveStringP8N
} from '@sage-js/core';
import {ClassDefinition} from './classdefinition/class';
import {Subroutine} from './subroutine';
import {Instruction} from './instruction/class';
import {InstructionBCL} from './instruction/bcl/class';
import {InstructionAbstract} from './instruction/abstract/class';

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
