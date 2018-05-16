import {
	utilSplitLines
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
			it(`${JSON.stringify(value)} : lines`, () => {
				const split = utilSplitLines(value);
				expect(split.length).toBe(lines);
			});
		}
	});
});
