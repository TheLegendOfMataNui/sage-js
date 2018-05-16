import {ExceptionInternal} from '../exception/internal';
import {MapInstructionAbstractByName} from '../types';
import {InstructionAbstract} from './abstract/class';
// tslint:disable-next-line: no-duplicate-imports
import * as abstract from './abstract';

let inited = false;
const constructorByName: MapInstructionAbstractByName = new Map();

/**
 * Init mappings.
 */
function init() {
	for (const value of Object.values(abstract)) {
		if (!(value.prototype instanceof InstructionAbstract)) {
			continue;
		}
		const Constructor = value;

		const name = Constructor.NAME;
		if (constructorByName.has(name)) {
			throw new ExceptionInternal(
				`Duplicate InstructionAbstract name ${name}`
			);
		}
		constructorByName.set(name, Constructor as any);
	}
	inited = true;
}

/**
 * Get constructor by name.
 *
 * @param name Instruction name.
 * @return The constructor or null.
 */
export function instructionAbstractByName(name: string) {
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
export function instructionAbstractByNameAll() {
	if (!inited) {
		init();
	}
	return new Map(constructorByName);
}
