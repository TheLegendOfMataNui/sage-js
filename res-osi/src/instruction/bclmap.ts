import {utilNumberToHex} from '@sage-js/core';

import {ExceptionInternal} from '../exception/internal';
import {
	MapInstructionBCLByName,
	MapInstructionBCLByOpcode
} from '../types';

import {InstructionBCL} from './bcl/class';
import * as bcl from './bcl';

let inited = false;
const constructorByName = new Map() as MapInstructionBCLByName;
const constructorByOpcode = new Map() as MapInstructionBCLByOpcode;

/**
 * Init mappings.
 */
function init() {
	for (const value of Object.values(bcl)) {
		if (!(value.prototype instanceof InstructionBCL)) {
			continue;
		}
		const Constructor = value;

		const name = Constructor.NAME;
		if (constructorByName.has(name)) {
			throw new ExceptionInternal(
				`Duplicate InstructionBCL name ${name}`
			);
		}
		constructorByName.set(name, Constructor as any);

		const opcode = Constructor.OPCODE.value;
		if (constructorByOpcode.has(opcode)) {
			throw new ExceptionInternal(
				`Duplicate InstructionBCL opcode 0x${utilNumberToHex(opcode)}`
			);
		}
		constructorByOpcode.set(opcode, Constructor as any);
	}
	inited = true;
}

/**
 * Get constructor by name.
 *
 * @param name Instruction name.
 * @returns The constructor or null.
 */
export function instructionBCLByName(name: string) {
	if (!inited) {
		init();
	}
	return constructorByName.get(name) || null;
}

/**
 * Get all by name.
 *
 * @returns The map.
 */
export function instructionBCLByNameAll() {
	if (!inited) {
		init();
	}
	return new Map(constructorByName);
}

/**
 * Get constructor by opcode.
 *
 * @param opcode The opcode.
 * @returns The constructor or null.
 */
export function instructionBCLByOpcode(opcode: number) {
	if (!inited) {
		init();
	}
	return constructorByOpcode.get(opcode) || null;
}

/**
 * Get all by opcode.
 *
 * @returns The map.
 */
export function instructionBCLByOpcodeAll() {
	if (!inited) {
		init();
	}
	return new Map(constructorByOpcode);
}
