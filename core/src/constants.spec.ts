import {
	MAX_SAFE_INTEGER,
	MIN_SAFE_INTEGER,
	INT8U_MAX,
	INT8U_MIN,
	INT8S_MAX,
	INT8S_MIN,
	INT16U_MAX,
	INT16U_MIN,
	INT16S_MAX,
	INT16S_MIN,
	INT32U_MAX,
	INT32U_MIN,
	INT32S_MAX,
	INT32S_MIN
} from './constants';

describe('constants', () => {
	describe('MAX_SAFE_INTEGER', () => {
		it('can subtract', () => {
			expect(MAX_SAFE_INTEGER - 1).toBeLessThan(MAX_SAFE_INTEGER);
		});
		it('cannot add', () => {
			expect(MAX_SAFE_INTEGER + 1).toBe(MAX_SAFE_INTEGER + 2);
		});
	});

	describe('MIN_SAFE_INTEGER', () => {
		it('can add', () => {
			expect(MIN_SAFE_INTEGER + 1).toBeGreaterThan(MIN_SAFE_INTEGER);
		});
		it('cannot subtract', () => {
			expect(MIN_SAFE_INTEGER - 1).toBe(MIN_SAFE_INTEGER - 2);
		});
	});

	for (const {bits, IntUArray, IntURange, IntSArray, IntSRange} of [
		{
			bits: 8,
			IntUArray: Uint8Array,
			IntURange: [INT8U_MIN, INT8U_MAX],
			IntSArray: Int8Array,
			IntSRange: [INT8S_MIN, INT8S_MAX]
		},
		{
			bits: 16,
			IntUArray: Uint16Array,
			IntURange: [INT16U_MIN, INT16U_MAX],
			IntSArray: Int16Array,
			IntSRange: [INT16S_MIN, INT16S_MAX]
		},
		{
			bits: 32,
			IntUArray: Uint32Array,
			IntURange: [INT32U_MIN, INT32U_MAX],
			IntSArray: Int32Array,
			IntSRange: [INT32S_MIN, INT32S_MAX]
		}
	]) {
		// eslint-disable-next-line no-bitwise
		const uMax = 0xFFFFFFFF >>> (32 - bits);

		const uMin = 0;

		// eslint-disable-next-line no-bitwise
		const sMax = uMax >>> 1;

		// eslint-disable-next-line no-bitwise
		const sMin = ~sMax;

		describe(`INT${bits}U_MIN`, () => {
			it('expected value', () => {
				const [v] = IntURange;
				expect(v).toBe(uMin);
			});

			it('can use', () => {
				const a = new IntUArray(1);
				const [v] = IntURange;
				a[0] = v;
				expect(a[0]).toBe(v);
			});

			it('wraps on -1', () => {
				const a = new IntUArray(1);
				const v = IntURange[0] - 1;
				a[0] = v;
				expect(a[0]).toBe(uMax);
			});
		});

		describe(`INT${bits}U_MAX`, () => {
			it('expected value', () => {
				const [, v] = IntURange;
				expect(v).toBe(uMax);
			});

			it('can use', () => {
				const a = new IntUArray(1);
				const [, v] = IntURange;
				a[0] = v;
				expect(a[0]).toBe(v);
			});

			it('wraps on +1', () => {
				const a = new IntUArray(1);
				const v = IntURange[1] + 1;
				a[0] = v;
				expect(a[0]).toBe(uMin);
			});
		});

		describe(`INT${bits}S_MIN`, () => {
			it('expected value', () => {
				const [v] = IntSRange;
				expect(v).toBe(sMin);
			});

			it('can use', () => {
				const a = new IntSArray(1);
				const [v] = IntSRange;
				a[0] = v;
				expect(a[0]).toBe(v);
			});

			it('wraps on -1', () => {
				const a = new IntSArray(1);
				const v = IntSRange[0] - 1;
				a[0] = v;
				expect(a[0]).toBe(sMax);
			});
		});

		describe(`INT${bits}S_MAX`, () => {
			it('expected value', () => {
				const [, v] = IntSRange;
				expect(v).toBe(sMax);
			});

			it('can use', () => {
				const a = new IntSArray(1);
				const [, v] = IntSRange;
				a[0] = v;
				expect(a[0]).toBe(v);
			});

			it('wraps on +1', () => {
				const a = new IntSArray(1);
				const v = IntSRange[1] + 1;
				a[0] = v;
				expect(a[0]).toBe(sMin);
			});
		});
	}
});
