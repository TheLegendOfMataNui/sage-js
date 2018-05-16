import {Exception} from './class';

describe('exception', () => {
	it('Message matches default error', () => {
		const msg = 'This is an example error.';
		const ex = new Exception(msg);
		const err = new Error(msg);
		expect(ex.message).toBe(err.message);
	});
});
