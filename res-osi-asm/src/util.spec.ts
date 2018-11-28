import {
	utilFormatErrorAtFileLocation
} from './util';

describe('utilFormatErrorAtFileLocation', () => {
	it('With filename', () => {
		expect(utilFormatErrorAtFileLocation('test', 4, 8, 'file.txt'))
			.toBe('test @ file.txt:4:8');
	});
	it('Without filename', () => {
		expect(utilFormatErrorAtFileLocation('test', 100, 200))
			.toBe('test @ 100:200');
	});
});
