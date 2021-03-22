import {
	utilSplitLines,
	utilFilenameEncode,
	utilFilenameDecode
} from './util';

describe('util', () => {
	describe('utilSplitLines', () => {
		for (const {value, lines} of [
			{
				value: '',
				lines: 1
			},
			{
				value: '\n',
				lines: 2
			},
			{
				value: '\r',
				lines: 2
			},
			{
				value: '\r\n',
				lines: 2
			},
			{
				value: 'aaa\rbbb\nccc',
				lines: 3
			},
			{
				value: 'aaa\r\nbbb\nccc',
				lines: 3
			},
			{
				value: 'aaa\rbbb\r\nccc',
				lines: 3
			},
			{
				value: 'aaa\r\rbbb\r\nccc',
				lines: 4
			},
			{
				value: 'aaa\n\nbbb\r\nccc',
				lines: 4
			},
			{
				value: 'aaa\nbbb\r\r\n\nccc\rddd',
				lines: 6
			}
		]) {
			it(`${JSON.stringify(value)} : ${lines}`, () => {
				const split = utilSplitLines(value);
				expect(split.length).toBe(lines);
			});
		}
	});

	describe('utilFilename*', () => {
		for (const value of [
			'testing123',
			'hello world',
			' hello',
			'world ',
			'  hello world  ',
			'file-name_abc 123.ext',
			'%',
			'%%',
			'%20',
			'',
			'\0'
		]) {
			it(`${JSON.stringify(value)}`, () => {
				const encoded = utilFilenameEncode(value);
				expect(encoded).toMatch(/^[a-z0-9\-_.\x20%]*$/i);
				if (encoded) {
					expect(encoded).toMatch(/^[^\x20]/);
					expect(encoded).toMatch(/[^\x20]$/);
				}
				const decoded = utilFilenameDecode(encoded);
				expect(decoded).toBe(value);
			});
		}
	});
});
