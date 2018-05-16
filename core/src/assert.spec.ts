import {
	assertSingleLine,
	assertCstring,
	assertInteger,
	assertRange,
	assertIntegerRange
} from './assert';
import {MAX_SAFE_INTEGER, MIN_SAFE_INTEGER} from './constants';
import {ExceptionRange} from './exception/range';
import {ExceptionValue} from './exception/value';

describe('assert', () => {
	describe('assertSingleLine', () => {
		describe('passes', () => {
			for (const v of [
				'',
				'Hello World!',
				'\x01\xFF'
			]) {
				it(JSON.stringify(v), () => {
					const err = assertSingleLine(v, 'test', false);
					expect(err).toBeNull();
				});
			}
		});

		describe('errors', () => {
			for (const v of [
				'\n',
				'\r',
				'Hello\nWorld',
				'Hello\rWorld'
			]) {
				it(JSON.stringify(v), () => {
					const err = assertSingleLine(v, 'test', false);
					if (err) {
						expect(err.constructor).toEqual(ExceptionValue);
					}
					else {
						expect(err).toBeTruthy();
					}
				});
			}
		});

		it('throws by default', () => {
			const err = assertSingleLine('\n', 'test', false);
			expect(() => {
				assertSingleLine('\n', 'test');
			}).toThrow(err);
		});

	});

	describe('assertCstring', () => {
		describe('passes', () => {
			for (const v of [
				'',
				'Hello World!',
				'\x01\xFF'
			]) {
				it(JSON.stringify(v), () => {
					const err = assertCstring(v, 'test', false);
					expect(err).toBeNull();
				});
			}
		});

		describe('errors', () => {
			for (const v of [
				'\x00',
				'Hello\x00World',
				'Hello World\x00',
				String.fromCharCode(0x100)
			]) {
				it(JSON.stringify(v), () => {
					const err = assertCstring(v, 'test', false);
					if (err) {
						expect(err.constructor).toEqual(ExceptionValue);
					}
					else {
						expect(err).toBeTruthy();
					}
				});
			}
		});

		it('throws by default', () => {
			const err = assertCstring('\x00', 'test', false);
			expect(() => {
				assertCstring('\x00', 'test');
			}).toThrow(err);
		});

	});

	describe('assertRange', () => {
		describe('passes', () => {
			for (const v of [
				[5, 0, 10],
				[-1, -2, 0],
				[0, 0, 0],
				[-100, -100, -100],
				[1, -Infinity, Infinity],
				[Infinity, 0, Infinity],
				[Infinity, Infinity, Infinity]
			]) {
				it(`${v[0]} in [${v[1]}:${v[2]}]`, () => {
					const err = assertRange(v[0], 'test', v[1], v[2], false);
					expect(err).toBeNull();
				});
			}
		});

		describe('errors', () => {
			for (const v of [
				[0, 5, 10],
				[-2, -1, 0],
				[1, 0, 0],
				[100, -100, -100],
				[NaN, -Infinity, Infinity],
				[-Infinity, 0, Infinity],
				[Infinity, -Infinity, -Infinity]
			]) {
				it(`${v[0]} not in [${v[1]}:${v[2]}]`, () => {
					const err = assertRange(v[0], 'test', v[1], v[2], false);
					if (err) {
						expect(err.constructor).toEqual(ExceptionRange);
					}
					else {
						expect(err).toBeTruthy();
					}
				});
			}
		});

		it('throws by default', () => {
			const err = assertRange(5, 'test', 10, 20, false);
			expect(() => {
				assertRange(5, 'test', 10, 20);
			}).toThrow(err);
		});
	});

	describe('assertInteger', () => {
		describe('passes', () => {
			for (const v of [
				0,
				1,
				-1,
				MAX_SAFE_INTEGER,
				MIN_SAFE_INTEGER
			]) {
				it(`${v} is integer`, () => {
					const err = assertInteger(v, 'test', false);
					expect(err).toBeNull();
				});
			}
		});

		describe('errors', () => {
			for (const v of [
				NaN,
				Infinity,
				-Infinity,
				0.001,
				-0.001,
				3.14,
				MAX_SAFE_INTEGER + 1,
				MIN_SAFE_INTEGER - 1
			]) {
				it(`${v} is not integer`, () => {
					const err = assertInteger(v, 'test', false);
					if (err) {
						expect(err.constructor).toEqual(ExceptionValue);
					}
					else {
						expect(err).toBeTruthy();
					}
				});
			}
		});

		it('throws by default', () => {
			const err = assertInteger(1.1, 'test', false);
			expect(() => {
				assertInteger(1.1, 'test');
			}).toThrow(err);
		});
	});

	describe('assertIntegerRange', () => {
		describe('passes', () => {
			for (const v of [
				[5, 0, 10],
				[-1, -2, 0],
				[0, 0, 0],
				[-100, -100, -100],
				[0, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER],
				[MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, MAX_SAFE_INTEGER]
			]) {
				it(`${v[0]} in [${v[1]}:${v[2]}]`, () => {
					const err = assertIntegerRange(
						v[0], 'test', v[1], v[2], false
					);
					expect(err).toBeNull();
				});
			}
		});

		describe('errors: integer', () => {
			for (const v of [
				[NaN, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER],
				[3.14, -100, 100],
				[0.001, -100, 100],
				[-0.001, -100, 100],
				[MAX_SAFE_INTEGER + 1, 0, 0]
			]) {
				it(`${v[0]} not in [${v[1]}:${v[2]}]`, () => {
					const err =
						assertIntegerRange(v[0], 'test', v[1], v[2], false);
					if (err) {
						expect(err.constructor).toEqual(ExceptionValue);
					}
					else {
						expect(err).toBeTruthy();
					}
				});
			}
		});

		describe('errors: range', () => {
			for (const v of [
				[0, 5, 10],
				[-2, -1, 0],
				[1, 0, 0],
				[100, -100, -100],
				[MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, 0]
			]) {
				it(`${v[0]} not in [${v[1]}:${v[2]}]`, () => {
					const err =
						assertIntegerRange(v[0], 'test', v[1], v[2], false);
					if (err) {
						expect(err.constructor).toEqual(ExceptionRange);
					}
					else {
						expect(err).toBeTruthy();
					}
				});
			}
		});

		it('throws by default', () => {
			const err = assertIntegerRange(5, 'test', 10, 20, false);
			expect(() => {
				assertIntegerRange(5, 'test', 10, 20);
			}).toThrow(err);
		});
	});
});
