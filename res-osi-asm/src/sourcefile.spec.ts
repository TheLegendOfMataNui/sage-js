import {SourceFile} from './sourcefile';

describe('SourceFile', () => {
	describe('getLines', () => {
		it('new line characters', () => {
			const sf = new SourceFile(
				'A\rB\nC\r\nD\n\r\nE\r\n\rF\n\r\n\rG\r\n\r\nH'
			);
			const lines = sf.getLines();
			const expected = [
				'A', 'B', 'C', 'D', '', 'E', '', 'F', '', '', 'G', '', 'H'
			];
			expect(JSON.stringify(lines)).toBe(JSON.stringify(expected));
		});

		it('range 5, 10', () => {
			const sf = new SourceFile(
				'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').join('\n')
			);
			const lines = sf.getLines(5, 10);
			const expected = 'FGHIJ'.split('');
			expect(JSON.stringify(lines)).toBe(JSON.stringify(expected));
		});
	});
});
