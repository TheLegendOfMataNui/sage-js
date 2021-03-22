import {ClassDefinitionPropertyTable1} from '../classdefinitionpropertytable/1';
import {ClassDefinitionMethodTable1} from '../classdefinitionmethodtable/1';

import {ClassDefinition} from './class';

/**
 * ClassDefinition constructor.
 */
export class ClassDefinition1 extends ClassDefinition {
	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE = 1;

	/**
	 * ClassDefinition property table.
	 */
	public classPropertyTable = new ClassDefinitionPropertyTable1();

	/**
	 * ClassDefinition method table.
	 */
	public classMethodTable = new ClassDefinitionMethodTable1();

	constructor() {
		super();
	}
}
