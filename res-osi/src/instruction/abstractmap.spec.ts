import {instructionAbstractByNameAll} from './abstractmap';

describe('abstractmap', () => {
	it('instructionAbstractByNameAll', () => {
		expect(instructionAbstractByNameAll().size).toBeGreaterThan(0);
	});
});
