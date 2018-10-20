import {MapInstructionByName} from '../types';
import {ExceptionInternal} from '../exception/internal';
import {Instruction} from './class';
import {instructionAbstractByNameAll} from './abstractmap';
import {instructionBCLByNameAll} from './bclmap';

let inited = false;
const constructorByName = new Map() as MapInstructionByName;

/**
 * Insert an entry into the map.
 *
 * @param name Instruction name.
 * @param Constructor Instruction constructor.
 */
function insert(name: string, Constructor: new() => Instruction) {
	if (constructorByName.has(name)) {
		throw new ExceptionInternal(
			`Duplicate InstructionBCL name ${name}`
		);
	}
	constructorByName.set(name, Constructor);
}

/**
 * Init mappings.
 */
function init() {
	for (const [name, Constructor] of instructionAbstractByNameAll()) {
		insert(name, Constructor);
	}
	for (const [name, Constructor] of instructionBCLByNameAll()) {
		insert(name, Constructor);
	}
	inited = true;
}

/**
 * Get constructor by name.
 *
 * @param name Instruction name.
 * @return The constructor or null.
 */
export function instructionByName(name: string) {
	if (!inited) {
		init();
	}
	return constructorByName.get(name) || null;
}

/**
 * Get all by name.
 *
 * @return The map.
 */
export function instructionByNameAll() {
	if (!inited) {
		init();
	}
	return new Map(constructorByName);
}
