import {
	PrimitiveInt32U,
	PrimitiveStringP8N
} from '@sage-js/core';
import {ClassDefinition} from './classdefinition/class';
import {ClassDefinitionProperty} from './classdefinitionproperty';
import {ClassDefinitionMethod} from './classdefinitionmethod';
import {Subroutine} from './subroutine';
import {Instruction} from './instruction/class';
import {InstructionBCL} from './instruction/bcl/class';
import {InstructionAbstract} from './instruction/abstract/class';

export interface IClassDefinitionTableEntry {
	/**
	 * Class structure.
	 */
	structure: ClassDefinition;

	/**
	 * Class name.
	 */
	name: PrimitiveStringP8N;
}

export interface ISubroutineTableEntry {
	/**
	 * Subroutine offset.
	 */
	offset: PrimitiveInt32U;

	/**
	 * Subroutine structure.
	 */
	subroutine: Subroutine;
}

export type MapClassDefinitionExtends = Map<
	ClassDefinition,
	ClassDefinition | null
>;

export type MapClassDefinitionTableEntryExtends = Map<
	IClassDefinitionTableEntry,
	IClassDefinitionTableEntry | null
>;

export type MapClassDefinitionTableEntryExtendsOptions = Map<
	IClassDefinitionTableEntry,
	IClassDefinitionTableEntry[]
>;

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

export interface ITransformString {
	/**
	 * BCL constructor.
	 */
	BCL: new() => InstructionBCL;

	/**
	 * ABS constructor.
	 */
	ABS: new() => InstructionAbstract;

	/**
	 * Arguments.
	 */
	args: Set<number>;
}

export interface IClassDefinitionPropertyFound {
	/**
	 * Class structure.
	 */
	definition: ClassDefinition;

	/**
	 * Property index.
	 */
	index: number;

	/**
	 * Property structure.
	 */
	entry: ClassDefinitionProperty;
}

export type IClassDefinitionPropertyFind =
	IClassDefinitionPropertyFound | null;

export interface IClassDefinitionMethodFound {
	/**
	 * Class structure.
	 */
	definition: ClassDefinition;

	/**
	 * Method index.
	 */
	index: number;

	/**
	 * Method structure.
	 */
	entry: ClassDefinitionMethod;
}

export type IClassDefinitionMethodFind =
	IClassDefinitionMethodFound | null;
