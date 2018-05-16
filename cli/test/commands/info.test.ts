import {test, expect} from '@oclif/test';

describe('info', () => {
	test
		.stdout()
		.command(['info'])
		.it('runs info', ctx => {
			expect(ctx.stdout).to.contain('Library versions:');
		});
});
