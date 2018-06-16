import {
	utilNumberIsNaN,
	utilStringToNumber
} from '@sage-js/core';
import {typed} from '../typed';
import {ASTNodeStatementInstruction} from '../ast/node/statement/instruction';
import {ASTNodeArgumentNumber} from '../ast/node/argument/number';
import {ASTNodeArgumentString} from '../ast/node/argument/string';
import {ParserDecoder} from './decoder';

describe('ParserDecoder', () => {
	describe('numbers', () => {
		const numbers = [
			'0',
			'42',
			'+42',
			'-42',
			'3.14',
			'-3.14',
			'+3.14',
			'0.01',
			'.01',
			'+.01',
			'-.01',
			'0x0',
			'0x42',
			'+0x42',
			'-0x42',
			'0x0123456789aBcDeF',
			'0b0',
			'0b10101010',
			'-0b10101010',
			'+0b10101010',
			'0o0',
			'0o01234567',
			'-0o01234567',
			'+0o01234567',
			'Infinity',
			'+Infinity',
			'-Infinity',
			'NaN',
			'-1e10',
			'1e10',
			'1.0e+10',
			'1.0e-10'
		];
		for (const unit of numbers) {
			const asm = `test ${unit}\n`;
			it(JSON.stringify(unit), () => {
				const decoder = new ParserDecoder();
				const ast = decoder.decode(asm);

				expect(decoder.syntaxErrors.length).toBe(0);

				const inst = typed.tryCast(
					ast.statements.entries[0],
					ASTNodeStatementInstruction
				);
				const arg = typed.tryCast(
					inst.arguments.entries[0],
					ASTNodeArgumentNumber
				);
				expect(arg.text).toBe(unit);

				const cast = utilStringToNumber(arg.text);
				if (unit === 'NaN') {
					expect(cast).toBeNaN();
				}
				else {
					expect(utilNumberIsNaN(cast)).toBe(false);
				}
			});
		}
	});

	describe('strings', () => {
		const strings = [
			'"hello world"',
			'""',
			'" "',
			'" \\t "',
			'"\\\\"'
		];
		for (const unit of strings) {
			const asm = `test ${unit}\n`;
			it(JSON.stringify(unit), () => {
				const decoder = new ParserDecoder();
				const ast = decoder.decode(asm);

				expect(decoder.syntaxErrors.length).toBe(0);

				const inst = typed.tryCast(
					ast.statements.entries[0],
					ASTNodeStatementInstruction
				);
				const arg = typed.tryCast(
					inst.arguments.entries[0],
					ASTNodeArgumentString
				);
				expect(arg.text).toBe(unit);
			});
		}
	});

	describe('unbalanced', () => {
		it('missing end', () => {
			const decoder = new ParserDecoder();
			expect(() => {
				try {
					decoder.decode([
						'begin BLOCK_A',
						'  inst',
						''
					].join('\n'));
				}
				catch (err) {
					expect(err.line).toBe(3);
					expect(err.column).toBe(1);
					throw err;
				}
			}).toThrow();
		});

		it('extra end', () => {
			const decoder = new ParserDecoder();
			expect(() => {
				try {
					decoder.decode([
						'',
						'  inst',
						'end',
						''
					].join('\n'));
				}
				catch (err) {
					expect(err.line).toBe(3);
					expect(err.column).toBe(1);
					throw err;
				}
			}).toThrow();
		});
	});
});
