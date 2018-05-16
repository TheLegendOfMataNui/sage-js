import {instructionBCLByNameAll} from './bclmap';

describe('bclmap', () => {
	it('instructionBCLByNameAll', () => {
		expect(instructionBCLByNameAll().size).toBeGreaterThan(0);
	});
});
