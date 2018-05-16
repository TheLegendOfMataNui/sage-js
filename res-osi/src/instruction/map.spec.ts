import {instructionByNameAll} from './map';

describe('instructionmap', () => {
	it('instructionByNameAll', () => {
		expect(instructionByNameAll().size).toBeGreaterThan(0);
	});
});
