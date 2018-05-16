import {
	formatErrorAtFileLocation
} from './util';

describe('formatErrorAtFileLocation', () => {
	it('With filename', () => {
		expect(formatErrorAtFileLocation('test', 4, 8, 'file.txt'))
			.toBe('test @ file.txt:4:8');
	});
	it('Without filename', () => {
		expect(formatErrorAtFileLocation('test', 100, 200))
			.toBe('test @ 100:200');
	});
});
