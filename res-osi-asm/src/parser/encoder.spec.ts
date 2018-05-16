import {ParserDecoder} from './decoder';
import {ParserEncoder} from './encoder';

describe('ParserEncoder', () => {
	const sources = [
		[
			'; comment',
			'simple',
			'commented      ; commented',
			'onetwo    1, 2',
			'pi        3.14',
			'',
			'begin block',
			'  begin subblock 42 ; commented',
			'',
			'    threefour 3, 4',
			'  end',
			'  subinst',
			'end',
			'last'
		]
	].map(lines => lines.join('\n') + '\n');
	sources.forEach((source, sourceI) => {
		it(`Source: ${sourceI}`, () => {
			const decoder = new ParserDecoder();
			const ast = decoder.decode(source);
			expect(decoder.syntaxErrors.length).toBe(0);

			const encoder = new ParserEncoder();
			encoder.optionIndentTab = false;
			encoder.optionIndentSize = 2;
			const asm = encoder.encode(ast);

			expect(asm).toBe(source);
		});
	});
});
