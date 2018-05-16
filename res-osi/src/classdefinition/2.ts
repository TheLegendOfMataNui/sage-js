import {ClassDefinitionPropertyTable2} from '../classdefinitionpropertytable/2';
import {ClassDefinitionMethodTable2} from '../classdefinitionmethodtable/2';
import {ClassDefinition} from './class';

/**
 * ClassDefinition constructor.
 */
export class ClassDefinition2 extends ClassDefinition {

	/**
	 * Size of entry count.
	 */
	public static ENTRY_COUNT_SIZE = 2;

	/**
	 * ClassDefinition property table.
	 */
	public classPropertyTable = new ClassDefinitionPropertyTable2();

	/**
	 * ClassDefinition method table.
	 */
	public classMethodTable = new ClassDefinitionMethodTable2();

	constructor() {
		super();
	}
}
