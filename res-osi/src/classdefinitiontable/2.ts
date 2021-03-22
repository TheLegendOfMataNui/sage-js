import {ClassDefinition2} from '../classdefinition/2';

import {ClassDefinitionTable} from './class';

/**
 * ClassDefinitionTable2 constructor.
 */
export class ClassDefinitionTable2 extends ClassDefinitionTable {
	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE = 2;

	/**
	 * Constructor for class definition.
	 *
	 * @returns Constructor function.
	 */
	public ClassDefinition = ClassDefinition2;

	constructor() {
		super();
	}
}
