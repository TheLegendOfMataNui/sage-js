import {ClassDefinition1} from '../classdefinition/1';
import {ClassDefinitionTable} from './class';

/**
 * ClassDefinitionTable1 constructor.
 */
export class ClassDefinitionTable1 extends ClassDefinitionTable {
	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE = 1;

	/**
	 * Constructor for class definition.
	 *
	 * @return Constructor function.
	 */
	public ClassDefinition = ClassDefinition1;

	constructor() {
		super();
	}
}
