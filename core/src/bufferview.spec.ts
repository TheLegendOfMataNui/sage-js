// tslint:disable: max-classes-per-file

import {MAX_SAFE_INTEGER, MIN_SAFE_INTEGER} from './constants';
import {utilNumberIsNaN} from './util';
import {ExceptionRange} from './exception/range';
import {ExceptionReadonly} from './exception/readonly';
import {ExceptionValue} from './exception/value';
import {BufferView} from './bufferview';

const readonlyMarked = new ExceptionReadonly('Marked readonly');

const numbersNotFinite = [
	NaN,
	Infinity,
	-Infinity
];
const numbersNotInteger = [
	...numbersNotFinite,
	-3.14,
	3 / 7,
	MAX_SAFE_INTEGER + 1,
	MIN_SAFE_INTEGER - 1
];

const unitsFromSize = [
	0,
	1,
	2,
	3
];

const unitsHex = ['00', '0A', '10', '42', '7F', 'FF'];
const unitsHexBytes = new Uint8Array([0x00, 0x0A, 0x10, 0x42, 0x7F, 0xFF]);
const unitsHexBad = ['100', 'NaN', '', 'bad'];

/**
 * Get all byte values.
 *
 * @return The array of values.
 */
function allBytes() {
	const r: number[] = [];
	for (let i = 0; i < 256; i++) {
		r.push(i);
	}
	return r;
}

/**
 * All byte values encoded in hex.
 *
 * @return The array of values.
 */
function allHex() {
	const r: string[] = [];
	for (let i = 0; i < 256; i++) {
		r.push((i < 0x10 ? '0' : '') + i.toString(16).toUpperCase());
	}
	return r;
}

/**
 * Creates bad bits exception.
 *
 * @param bits Bits value
 */
function badBits(bits: number) {
	return new Error(`Unexpected bits value: ${bits}`);
}

/**
 * Wrapper for .getView and .readView methods.
 *
 * @param b Buffer view.
 * @param read Use read or get.
 * @param size Bytes to be read.
 * @param offset Offset to read at.
 * @param readonly Optionally mark it readonly.
 * @return The buffer view subview.
 */
function viewGR(
	b: BufferView,
	read: boolean,
	size = -1,
	offset = -1,
	readonly = false
) {
	if (read) {
		if (offset >= 0) {
			b.offset = offset;
		}
		const prevOffset = b.offset;
		const r = b.readView(size, readonly);
		if (prevOffset + r.size !== b.offset) {
			throw new Error('Read did not advance read amount');
		}
		return r;
	}
	return b.getView(size, offset, readonly);
}

/**
 * Wrapper for .setView and .writeView methods.
 *
 * @param b Buffer view.
 * @param write Use write or set.
 * @param data View to be written.
 * @param offset Offset to write at.
 */
function viewSW(
	b: BufferView,
	write: boolean,
	data: BufferView,
	offset = -1
) {
	if (!write) {
		b.setView(data, offset);
		return;
	}
	if (offset >= 0) {
		b.offset = offset;
	}
	const prevOffset = b.offset;
	b.writeView(data);
	if (prevOffset + data.size !== b.offset) {
		throw new Error('Write did not advance written amount');
	}
}

/**
 * Wrapper for .getInt and .readInt methods.
 *
 * @param b Buffer view.
 * @param read Use read or get.
 * @param bits Integer bits.
 * @param signed Signed integer or not.
 * @return Integer value.
 */
function intGR(
	b: BufferView,
	read: boolean,
	offset: number,
	bits: number,
	signed: boolean
) {
	const o = offset;
	const po = b.offset;
	if (read && offset >= 0) {
		b.offset = offset;
	}
	let r;
	switch (bits) {
		case 8: {
			if (signed) {
				r = read ? b.readInt8S() : b.getInt8S(o);
			}
			else {
				r = read ? b.readInt8U() : b.getInt8U(o);
			}
			break;
		}
		case 16: {
			if (signed) {
				r = read ? b.readInt16S() : b.getInt16S(o);
			}
			else {
				r = read ? b.readInt16U() : b.getInt16U(o);
			}
			break;
		}
		case 32: {
			if (signed) {
				r = read ? b.readInt32S() : b.getInt32S(o);
			}
			else {
				r = read ? b.readInt32U() : b.getInt32U(o);
			}
			break;
		}
		default: {
			throw badBits(bits);
		}
	}
	const bytes = bits / 8;
	if (read && b.offset !== po + bytes) {
		throw new Error('Read method did not move forward expected amount');
	}
	return r;
}

/**
 * Wrapper for .setInt and .writeInt methods.
 *
 * @param b Buffer view.
 * @param write Use write or set.
 * @param value Integer value.
 * @param offset Buffer offset
 * @param bits Integer bits.
 * @param signed Signed integer or not.
 */
function intSW(
	b: BufferView,
	write: boolean,
	value: number,
	offset: number,
	bits: number,
	signed: boolean
) {
	const o = offset;
	const po = b.offset;
	if (write && offset >= 0) {
		b.offset = offset;
	}
	switch (bits) {
		case 8: {
			if (signed) {
				if (write) {
					b.writeInt8S(value);
				}
				else {
					b.setInt8S(value, o);
				}
			}
			else if (write) {
				b.writeInt8U(value);
			}
			else {
				b.setInt8U(value, o);
			}
			break;
		}
		case 16: {
			if (signed) {
				if (write) {
					b.writeInt16S(value);
				}
				else {
					b.setInt16S(value, o);
				}
			}
			else if (write) {
				b.writeInt16U(value);
			}
			else {
				b.setInt16U(value, o);
			}
			break;
		}
		case 32: {
			if (signed) {
				if (write) {
					b.writeInt32S(value);
				}
				else {
					b.setInt32S(value, o);
				}
			}
			else if (write) {
				b.writeInt32U(value);
			}
			else {
				b.setInt32U(value, o);
			}
			break;
		}
		default: {
			throw badBits(bits);
		}
	}
	const bytes = bits / 8;
	if (write && b.offset !== po + bytes) {
		throw new Error('Read method did not move forward expected amount');
	}
}

/**
 * Wrapper for .getFloat and .readFloat methods.
 *
 * @param b Buffer view.
 * @param read Use read or get.
 * @param bits Integer bits.
 * @return Float value.
 */
function floatGR(
	b: BufferView,
	read: boolean,
	offset: number,
	bits: number
) {
	const o = offset;
	const po = b.offset;
	if (read && offset >= 0) {
		b.offset = offset;
	}
	let r;
	switch (bits) {
		case 32: {
			r = read ? b.readFloat32() : b.getFloat32(o);
			break;
		}
		case 64: {
			r = read ? b.readFloat64() : b.getFloat64(o);
			break;
		}
		default: {
			throw badBits(bits);
		}
	}
	const bytes = bits / 8;
	if (read && b.offset !== po + bytes) {
		throw new Error('Read method did not move forward expected amount');
	}
	return r;
}

/**
 * Wrapper for .setFloat and .writeFloat methods.
 *
 * @param b Buffer view.
 * @param read Use read or get.
 * @param bits Integer bits.
 */
function floatSW(
	b: BufferView,
	write: boolean,
	value: number,
	endianL: boolean,
	offset: number,
	bits: number
) {
	const o = offset;
	const po = b.offset;
	if (write && offset >= 0) {
		b.offset = offset;
	}
	switch (bits) {
		case 32: {
			if (write) {
				b.writeFloat32(value);
			}
			else {
				b.setFloat32(value, o);
			}
			break;
		}
		case 64: {
			if (write) {
				b.writeFloat64(value);
			}
			else {
				b.setFloat64(value, o);
			}
			break;
		}
		default: {
			throw badBits(bits);
		}
	}
	const bytes = bits / 8;
	if (write && b.offset !== po + bytes) {
		throw new Error('Write method did not move forward expected amount');
	}
}

/**
 * Create int test units.
 *
 * @param bits Bits in the integer.
 * @return Units object.
 */
function createIntUnits(bits: number) {
	// tslint:disable-next-line: no-bitwise
	const uMax = 0xFFFFFFFF >>> (32 - bits);
	const uMin = 0;

	// tslint:disable-next-line: no-bitwise
	const sMax = uMax >>> 1;
	// tslint:disable-next-line: no-bitwise
	const sMin = ~sMax;

	const ints = new Set([uMin, uMax, sMin, sMax]);

	// Generate a bunch of integers that may be edge cases.
	for (let i = bits; i; i--) {
		// tslint:disable-next-line: no-bitwise
		const u = uMax >>> (i - 1);
		// tslint:disable-next-line: no-bitwise
		const s = ~(u >> 1);
		ints.add(u);
		ints.add(s);
	}
	for (let i = 0; i < bits; i++) {
		// tslint:disable-next-line: no-bitwise
		const u = 1 << i;
		// tslint:disable-next-line: no-bitwise
		const s = ~(u >> 1);
		ints.add(u);
		ints.add(s);
	}

	const intsU = Array.from(ints)
		.filter(v => v >= uMin && v <= uMax)
		.sort((a, b) => a - b);

	const intsS = Array.from(ints)
		.filter(v => v >= sMin && v <= sMax)
		.sort((a, b) => a - b);

	let unitsS;
	let unitsU;
	const bytes = bits / 8;

	switch (bits) {
		case 8: {
			unitsS = new Int8Array(intsS);
			unitsU = new Uint8Array(intsU);
			break;
		}
		case 16: {
			unitsS = new Int16Array(intsS);
			unitsU = new Uint16Array(intsU);
			break;
		}
		case 32: {
			unitsS = new Int32Array(intsS);
			unitsU = new Uint32Array(intsU);
			break;
		}
		default: {
			throw badBits(bits);
		}
	}

	const bufferUB = new DataView(new ArrayBuffer(unitsU.byteLength));
	const bufferUL = new DataView(new ArrayBuffer(unitsU.byteLength));
	const bufferSB = new DataView(new ArrayBuffer(unitsS.byteLength));
	const bufferSL = new DataView(new ArrayBuffer(unitsS.byteLength));

	for (let i = 0; i < unitsU.length; i++) {
		switch (bits) {
			case 8: {
				bufferUB.setUint8(bytes * i, unitsU[i]);
				bufferUL.setUint8(bytes * i, unitsU[i]);
				break;
			}
			case 16: {
				bufferUB.setUint16(bytes * i, unitsU[i], false);
				bufferUL.setUint16(bytes * i, unitsU[i], true);
				break;
			}
			case 32: {
				bufferUB.setUint32(bytes * i, unitsU[i], false);
				bufferUL.setUint32(bytes * i, unitsU[i], true);
				break;
			}
			default: {
				throw badBits(bits);
			}
		}
	}

	for (let i = 0; i < unitsS.length; i++) {
		switch (bits) {
			case 8: {
				bufferSB.setInt8(bytes * i, unitsS[i]);
				bufferSL.setInt8(bytes * i, unitsS[i]);
				break;
			}
			case 16: {
				bufferSB.setInt16(bytes * i, unitsS[i], false);
				bufferSL.setInt16(bytes * i, unitsS[i], true);
				break;
			}
			case 32: {
				bufferSB.setInt32(bytes * i, unitsS[i], false);
				bufferSL.setInt32(bytes * i, unitsS[i], true);
				break;
			}
			default: {
				throw badBits(bits);
			}
		}
	}

	return {
		bits,
		bytes,
		uMax,
		uMin,
		sMax,
		sMin,
		unitsS,
		unitsU,
		bufferUB,
		bufferUL,
		bufferSB,
		bufferSL
	};
}

/**
 * Create float test units.
 *
 * @param bits Bits in the float.
 * @return Units object.
 */
function createFloatUnits(bits: number) {
	const values = [
		0,
		...numbersNotInteger,
		-1
	];
	const bytes = bits / 8;
	let units;
	switch (bits) {
		case 32: {
			units = new Float32Array(values);
			break;
		}
		case 64: {
			units = new Float64Array(values);
			break;
		}
		default: {
			throw badBits(bits);
		}
	}
	const bufferB = new DataView(new ArrayBuffer(units.byteLength));
	const bufferL = new DataView(new ArrayBuffer(units.byteLength));

	for (let i = 0; i < units.length; i++) {
		const v = units[i];
		const o = i * bytes;
		switch (bits) {
			case 32: {
				bufferB.setFloat32(o, v, false);
				bufferL.setFloat32(o, v, true);
				break;
			}
			case 64: {
				bufferB.setFloat64(o, v, false);
				bufferL.setFloat64(o, v, true);
				break;
			}
			default: {
				throw badBits(bits);
			}
		}
	}

	return {
		bits,
		bytes,
		units,
		bufferB,
		bufferL
	};
}

describe('BufferView', () => {
	describe('constructor', () => {
		it('endianL', () => {
			const bB = new BufferView(new Uint8Array([0]), false);
			const bL = new BufferView(new Uint8Array([0]), true);

			expect(bB.endianL).toBe(false);
			expect(bB.endianB).toBe(true);
			expect(bL.endianL).toBe(true);
			expect(bL.endianB).toBe(false);
		});

		it('offset', () => {
			const values = [1, 2, 3, 4, 5, 6, 7, 8];
			const valuesSlice = values.slice(1);
			const a1 = new Uint8Array(values);
			const a2 = new Uint8Array(valuesSlice);

			const b1 = new BufferView(a1, true, 1);
			const b2 = new BufferView(a2, true);

			expect(b1.size).toBe(b2.size);
			expect(b1.compare(b2)).toBe(-1);

			for (const offset of [-1, values.length + 1]) {
				expect(() => {
					try {
						return new BufferView(a1, true, offset);
					}
					catch (err) {
						expect(err.constructor).toBe(ExceptionRange);
						throw err;
					}
				}).toThrow();
			}
		});

		it('size', () => {
			const a = new Uint8Array(42);
			const bDefault = new BufferView(a, true);
			expect(bDefault.size).toBe(42);

			const bOffset1 = new BufferView(a, true, 1);
			expect(bOffset1.size).toBe(41);

			const bSize2 = new BufferView(a, true, 3, 2);
			expect(bSize2.size).toBe(2);

			const bSize0 = new BufferView(a, true, 8, 0);
			expect(bSize0.size).toBe(0);

			const bSize0End = new BufferView(a, true, 42, 0);
			expect(bSize0End.size).toBe(0);

			expect(() => {
				try {
					return new BufferView(a, true, 42, 1);
				}
				catch (err) {
					expect(err.constructor).toBe(ExceptionRange);
					throw err;
				}
			}).toThrow();
		});

		it('readonly', () => {
			const bw = new BufferView(new Uint8Array([0]), true, 0, -1);
			const br = new BufferView(new Uint8Array([0]), true, 0, -1, true);

			expect(bw.readonly).toBe(false);
			expect(br.readonly).toBe(true);
		});

		it('offset', () => {
			const b = BufferView.fromSize(10, true);
			for (let i = 0; i < b.size; i++) {
				b.offset = i;
				expect(b.offset).toBe(i);
			}

			for (const bad of numbersNotInteger) {
				expect(() => {
					try {
						b.offset = bad;
					}
					catch (err) {
						expect(err.constructor).toBe(ExceptionValue);
						throw err;
					}
				}).toThrow();
			}

			for (const bad of [-1, b.size + 1, MAX_SAFE_INTEGER]) {
				expect(() => {
					try {
						b.offset = bad;
					}
					catch (err) {
						expect(err.constructor).toBe(ExceptionRange);
						throw err;
					}
				}).toThrow();
			}
		});
	});

	describe('assertRemaining', () => {
		it('0 remaining, 0 needed', () => {
			const b = BufferView.fromSize(10, true);
			b.assertRemaining(0, 10);
			expect(true).toBe(true);

			b.offset = 10;
			b.assertRemaining(0);
			expect(true).toBe(true);
		});

		it('0 remaining, 1 needed', () => {
			const b = BufferView.fromSize(10, true);
			expect(() => {
				try {
					b.assertRemaining(1, 10);
				}
				catch (err) {
					expect(err.constructor).toBe(ExceptionRange);
					throw err;
				}
			}).toThrow();

			b.offset = 10;
			expect(() => {
				try {
					b.assertRemaining(1);
				}
				catch (err) {
					expect(err.constructor).toBe(ExceptionRange);
					throw err;
				}
			}).toThrow();
		});

		it('1 remaining, 1 needed', () => {
			const b = BufferView.fromSize(10, true);
			b.assertRemaining(1, 9);
			expect(true).toBe(true);

			b.offset = 9;
			b.assertRemaining(1);
			expect(true).toBe(true);
		});
	});

	describe('assertWritable', () => {
		const bw = new BufferView(new Uint8Array([0]), true, 0, -1);
		const br = new BufferView(new Uint8Array([0]), true, 0, -1, true);

		it('no throw on writable', () => {
			bw.assertWritable();
			expect(true).toBe(true);
		});

		it('throw on readonly', () => {
			expect(() => {
				br.assertWritable();
			}).toThrow(readonlyMarked);
		});
	});

	describe('compare', () => {
		const loopCount = 24;

		it('find no difference', () => {
			for (let i = 0; i < loopCount; i++) {
				const a1 = new Uint8Array(i);
				const a2 = new Uint8Array(i);
				const b1 = new BufferView(a1, true);
				const b2 = new BufferView(a2, true);
				expect(b1.compare(b2)).toBe(-1);
				expect(b2.compare(b1)).toBe(-1);
			}
		});

		it('find first different byte', () => {
			for (let i = 0; i < loopCount; i++) {
				const a1 = new Uint8Array(i + 2);
				const a2 = new Uint8Array(i + 2);
				a1[i] = 1;
				a2[i + 1] = 0xFF;
				const b1 = new BufferView(a1, true);
				const b2 = new BufferView(a2, true);
				expect(b1.compare(b2)).toBe(i);
				expect(b2.compare(b1)).toBe(i);
			}
		});

		it('find difference from size', () => {
			for (let i = 0; i < loopCount; i++) {
				const a1 = new Uint8Array(i);
				const a2 = new Uint8Array(i + 1);
				const b1 = new BufferView(a1, true);
				const b2 = new BufferView(a2, true);
				expect(b1.compare(b2)).toBe(i);
				expect(b2.compare(b1)).toBe(i);
			}
		});
	});

	describe('copy', () => {
		it('simple', () => {
			const values = [1, 2, 3, 4];
			const buffer = new BufferView(new Uint8Array(values), true);
			const copy = buffer.copy();
			expect(copy.compare(buffer)).toBe(-1);

			buffer.setInt8U(0, 1);
			expect(copy.compare(buffer)).toBe(1);
		});

		it('slice', () => {
			const values = [1, 2, 3, 4];
			const buffer = new BufferView(new Uint8Array(values), true, 1, 2);
			expect(buffer.copy().compare(buffer)).toBe(-1);
		});

		it('offset', () => {
			const values = [1, 2, 3, 4];
			const buffer = new BufferView(new Uint8Array(values), true);
			buffer.offset = 2;
			const copy = buffer.copy();
			expect(copy.compare(buffer)).toBe(-1);
			expect(copy.offset).toBe(0);
		});

		it('readonly', () => {
			const values = [1, 2, 3, 4];
			const bufferW = new BufferView(new Uint8Array(values), true);
			const bufferR =
				new BufferView(new Uint8Array(values), true, 0, -1, true);
			const copyR = bufferW.copy(true);
			const copyW = bufferR.copy();

			expect(copyW.readonly).toBe(false);
			expect(copyR.readonly).toBe(true);
		});

		it('Preserve endianL', () => {
			const bufferB = BufferView.fromSize(10, false).copy();
			const bufferL = BufferView.fromSize(10, true).copy();

			// If either marked readonly, then readonly.
			expect(bufferB.endianL).toBe(false);
			expect(bufferL.endianL).toBe(true);
		});
	});

	describe('concat', () => {
		it('1 buffer', () => {
			const values = [1, 2, 3, 4];
			const buffer = new BufferView(new Uint8Array(values), true);
			const concated = BufferView.concat([buffer], true);
			expect(concated.compare(buffer)).toBe(-1);

			// Concat also copies buffer.
			concated.setInt8U(0, 0);
			expect(concated.compare(buffer)).toBe(0);
		});

		it('2 buffers', () => {
			const values = [
				[1, 2, 3, 4],
				[6, 7, 8, 9]
			];
			const merged = [...values[0], ...values[1]];
			const concated = BufferView.concat([
				new BufferView(new Uint8Array(values[0]), true),
				new BufferView(new Uint8Array(values[1]), true)
			], true);
			const expected = new BufferView(new Uint8Array(merged), true);
			expect(concated.compare(expected)).toBe(-1);
		});

		it('endianL', () => {
			const values = [1, 2, 3, 4];
			const b1 = new BufferView(new Uint8Array(values), false);
			const b2 = new BufferView(new Uint8Array(values), true);
			const cB = BufferView.concat([b1, b2], false);
			const cL = BufferView.concat([b1, b2], true);

			expect(cB.endianL).toBe(false);
			expect(cL.endianL).toBe(true);
		});

		it('readonly', () => {
			const values = [1, 2, 3, 4];
			const buffer = new BufferView(new Uint8Array(values), true);
			const concated = BufferView.concat([buffer], true, true);

			expect(concated.readonly).toBe(true);
		});

		it('slices', () => {
			const values = [
				[1, 2, 3, 4],
				[6, 7, 8, 9]
			];
			const merged = [
				...values[0].slice(0, 2),
				...values[1].slice(2, 4)
			];
			const concated = BufferView.concat([
				new BufferView(new Uint8Array(values[0]), true, 0, 2),
				new BufferView(new Uint8Array(values[1]), true, 2, 2)
			], true);
			const expected = new BufferView(new Uint8Array(merged), true);
			expect(concated.compare(expected)).toBe(-1);
		});
	});

	describe('fromSize', () => {
		it('size', () => {
			for (const size of unitsFromSize) {
				const b = BufferView.fromSize(size, true);
				expect(b.size).toBe(size);
			}

			for (const size of numbersNotInteger) {
				expect(() => {
					try {
						BufferView.fromSize(size, true);
					}
					catch (err) {
						expect(err.constructor).toBe(ExceptionValue);
						throw err;
					}
				}).toThrow();
			}
		});

		it('endianL', () => {
			expect(BufferView.fromSize(1, false).endianL).toBe(false);
			expect(BufferView.fromSize(1, true).endianL).toBe(true);
		});

		it('readonly', () => {
			expect(BufferView.fromSize(1, false).endianL).toBe(false);
			expect(BufferView.fromSize(1, true).endianL).toBe(true);
		});
	});

	describe('fromHexArray', () => {
		it('decoded', () => {
			const b = BufferView.fromHexArray(unitsHex, true);
			const expected = new BufferView(unitsHexBytes, true);
			expect(b.size).toBe(unitsHex.length);
			expect(b.compare(expected)).toBe(-1);

			for (const size of numbersNotInteger) {
				expect(() => {
					try {
						BufferView.fromSize(size, true);
					}
					catch (err) {
						expect(err.constructor).toBe(ExceptionValue);
						throw err;
					}
				}).toThrow();
			}
		});

		it('empty', () => {
			const b = BufferView.fromHexArray([], true);
			expect(b.size).toBe(0);
		});

		it('odd lengths', () => {
			const b = BufferView.fromHexArray(
				['0', '00', '0', '00', '0'],
				true
			);
			expect(b.size).toBe(5);
		});

		it('invalid hex', () => {
			for (const badByte of unitsHexBad) {
				expect(() => {
					try {
						BufferView.fromHexArray([badByte], true);
					}
					catch (err) {
						expect(err.constructor).toBe(ExceptionValue);
						throw err;
					}
				}).toThrow();
			}
		});

		it('endianL', () => {
			expect(
				BufferView.fromHexArray(unitsHex, false).endianL
			).toBe(false);
			expect(
				BufferView.fromHexArray(unitsHex, true).endianL
			).toBe(true);
		});

		it('readonly', () => {
			expect(
				BufferView.fromHexArray(unitsHex, true).readonly
			).toBe(false);
			expect(
				BufferView.fromHexArray(unitsHex, true, true).readonly
			).toBe(true);
		});
	});

	describe('fromHex', () => {
		it('decoded', () => {
			const delimiters = ['', ' ', ',', '_', '\r\n', '\x00'];
			for (const delimiter of delimiters) {
				const b = BufferView.fromHex(unitsHex.join(delimiter), true);
				const expected = new BufferView(unitsHexBytes, true);
				expect(b.size).toBe(unitsHex.length);
				expect(b.compare(expected)).toBe(-1);

				for (const size of numbersNotInteger) {
					expect(() => {
						try {
							BufferView.fromSize(size, true);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionValue);
							throw err;
						}
					}).toThrow();
				}
			}
		});

		it('empty', () => {
			const b = BufferView.fromHex('', true);
			expect(b.size).toBe(0);
		});

		it('odd length', () => {
			const b1 = BufferView.fromHex('0000000', true);
			expect(b1.size).toBe(4);

			const b2 = BufferView.fromHex('0', true);
			expect(b2.size).toBe(1);
		});

		it('endianL', () => {
			const str = unitsHex.join('');
			expect(BufferView.fromHex(str, false).endianL).toBe(false);
			expect(BufferView.fromHex(str, true).endianL).toBe(true);
		});

		it('readonly', () => {
			const str = unitsHex.join('');
			expect(BufferView.fromHex(str, true).readonly).toBe(false);
			expect(BufferView.fromHex(str, true, true).readonly).toBe(true);
		});
	});

	describe('toInt8Array', () => {
		it('Correct data', () => {
			const b = new BufferView(new Uint8Array([1, 0xFF, 3, 4]), true);
			const a = b.getView(2, 1).toInt8Array();
			expect(a.length).toBe(2);
			expect(a[0]).toBe(-1);
			expect(a[1]).toBe(3);
		});

		it('Data copied', () => {
			const values = new Uint8Array([1, 2, 3, 4]);
			const b = new BufferView(values, true);
			const a = b.toInt8Array();
			a[0] = 42;
			expect(values[0]).toBe(1);
			expect(a[0]).toBe(42);
		});
	});

	describe('toUint8Array', () => {
		it('Correct data', () => {
			const b = new BufferView(new Uint8Array([1, 0xFF, 3, 4]), true);
			const a = b.getView(2, 1).toUint8Array();
			expect(a.length).toBe(2);
			expect(a[0]).toBe(0xFF);
			expect(a[1]).toBe(3);
		});

		it('Data copied', () => {
			const values = new Uint8Array([1, 2, 3, 4]);
			const b = new BufferView(values, true);
			const a = b.toUint8Array();
			a[0] = 42;
			expect(values[0]).toBe(1);
			expect(a[0]).toBe(42);
		});
	});

	describe('toDataView', () => {
		it('Correct data', () => {
			const b = new BufferView(new Uint8Array([1, 0xFF, 3, 4]), true);
			const d = b.getView(2, 1).toDataView();
			expect(d.byteLength).toBe(2);
			expect(d.getUint8(0)).toBe(0xFF);
			expect(d.getUint8(1)).toBe(3);
		});

		it('Data copied', () => {
			const values = new Uint8Array([1, 2, 3, 4]);
			const b = new BufferView(new Uint8Array([1, 0xFF, 3, 4]), true);
			const d = b.toDataView();
			d.setUint8(0, 42);
			expect(values[0]).toBe(1);
			expect(d.getUint8(0)).toBe(42);
		});
	});

	describe('toDataView', () => {
		it('Correct data', () => {
			const b = new BufferView(new Uint8Array([1, 0xFF, 3, 4]), true);
			const d = new DataView(b.getView(2, 1).toArrayBuffer());
			expect(d.byteLength).toBe(2);
			expect(d.getUint8(0)).toBe(0xFF);
			expect(d.getUint8(1)).toBe(3);
		});

		it('Data copied', () => {
			const values = new Uint8Array([1, 2, 3, 4]);
			const b = new BufferView(new Uint8Array([1, 0xFF, 3, 4]), true);
			const d = new DataView(b.toArrayBuffer());
			d.setUint8(0, 42);
			expect(values[0]).toBe(1);
			expect(d.getUint8(0)).toBe(42);
		});
	});

	describe('toHexArray', () => {
		it('Correct data', () => {
			const hex = allHex();
			const b = new BufferView(new Uint8Array(allBytes()), true);
			const hexArray = b.toHexArray();
			expect(hexArray.length).toBe(hex.length);
			for (let i = 0; i < hexArray.length; i++) {
				expect(hexArray[i]).toBe(hex[i]);
				expect(hexArray[i].length).toBe(2);
			}
		});
	});

	describe('toHex', () => {
		it('Correct data', () => {
			const hex = allHex();
			const b = new BufferView(new Uint8Array(allBytes()), true);
			expect(b.toHex('').length).toBe(hex.length * 2);
			expect(b.toHex()).toBe(hex.join(''));
			expect(b.toHex(' ')).toBe(hex.join(' '));
			expect(b.toHex('test')).toBe(hex.join('test'));
		});
	});

	describe('view', () => {
		for (const rw of [false, true]) {
			describe(rw ? 'readView' : 'getView', () => {
				const values = [1, 2, 3, 4];
				const buffer = new BufferView(new Uint8Array(values), true);
				const slice = new BufferView(new Uint8Array(values), true, 1);
				const sliceL =
					new BufferView(new Uint8Array(values), true, 1, 2);

				it('Slice compare', () => {
					expect(
						viewGR(buffer, rw, -1, 1).compare(slice)
					).toBe(-1);

					expect(
						viewGR(buffer, rw, 2, 1).compare(sliceL)
					).toBe(-1);
				});

				if (!rw) {
					it('Relative get', () => {
						buffer.offset = 1;
						expect(
							viewGR(buffer, rw).compare(slice)
						).toBe(-1);
					});
				}

				it('Empty read', () => {
					const empty = BufferView.fromSize(0, true);

					// Empty ranges.
					expect(
						viewGR(buffer, rw, 0, 0).compare(empty)
					).toBe(-1);
					expect(
						viewGR(buffer, rw, 0, buffer.size).compare(empty)
					).toBe(-1);
				});

				it('Preserve endianL', () => {
					const bufferB = BufferView.fromSize(10, false);
					const bufferL = BufferView.fromSize(10, true);

					// If either marked readonly, then readonly.
					expect(
						viewGR(bufferB, rw, -1, -1).endianL
					).toBe(false);
					expect(
						viewGR(bufferL, rw, -1, -1).endianL
					).toBe(true);
				});

				it('Preserve readonly', () => {
					const bufferW = BufferView.fromSize(10, true);
					const bufferR = BufferView.fromSize(10, true, true);

					// If either marked readonly, then readonly.
					expect(
						viewGR(bufferW, rw, -1, -1, false).readonly
					).toBe(false);
					expect(
						viewGR(bufferW, rw, -1, -1, true).readonly
					).toBe(true);
					expect(
						viewGR(bufferR, rw, -1, -1, false).readonly
					).toBe(true);
				});

				it('Parent changes', () => {
					const mutable = BufferView.fromSize(2, true);

					mutable.getView(1, 1).setInt8U(42);
					expect(mutable.getInt8U(1)).toBe(42);
				});

				it('Bounds checking', () => {
					expect(() => {
						try {
							viewGR(buffer, rw, values.length + 1);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionRange);
							throw err;
						}
					}).toThrow();

					expect(() => {
						try {
							viewGR(buffer, rw, 1, values.length);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionRange);
							throw err;
						}
					}).toThrow();
				});
			});

			describe(rw ? 'writeView' : 'setView', () => {
				it('Write data', () => {
					const b = new BufferView(
						new Uint8Array([1, 2, 3, 4]),
						true
					);
					const after = new BufferView(
						new Uint8Array([1, 5, 6, 4]),
						true
					);

					const wb = new BufferView(new Uint8Array([5, 6]), true);
					viewSW(b, rw, wb, 1);
					expect(b.compare(after)).toBe(-1);
				});

				if (!rw) {
					it('Relative set', () => {
						const b = new BufferView(
							new Uint8Array([0, 1, 2]),
							true
						);
						const after = new BufferView(
							new Uint8Array([0, 7, 8]),
							true
						);

						b.offset = 1;
						viewSW(b, rw, new BufferView(
							new Uint8Array([7, 8]),
							true
						));
						expect(b.compare(after)).toBe(-1);
					});
				}

				it('Empty write', () => {
					const values = [1, 2, 3, 4];
					const b = new BufferView(new Uint8Array(values), true);
					const bCopy = b.copy();
					const empty = BufferView.fromSize(0, true);

					// Empty writes.
					viewSW(b, rw, empty, 0);
					expect(b.compare(bCopy)).toBe(-1);

					viewSW(b, rw, empty, b.size);
					expect(b.compare(bCopy)).toBe(-1);
				});

				describe('Writing over source range', () => {
					it('Overlap start', () => {
						const values = [1, 2, 3, 4, 5, 6, 7, 8];
						const after = [1, 4, 5, 6, 7, 6, 7, 8];
						const b = new BufferView(new Uint8Array(values), true);

						const d = b.getView(4, 3);
						viewSW(b, rw, d, 1);

						const a = new BufferView(new Uint8Array(after), true);
						expect(b.compare(a)).toBe(-1);
					});

					it('Overlap end', () => {
						const values = [1, 2, 3, 4, 5, 6, 7, 8];
						const after = [1, 2, 3, 2, 3, 4, 5, 8];
						const b = new BufferView(new Uint8Array(values), true);

						const d = b.getView(4, 1);
						viewSW(b, rw, d, 3);

						const a = new BufferView(new Uint8Array(after), true);
						expect(b.compare(a)).toBe(-1);
					});

					it('Overlap all', () => {
						const values = [1, 2, 3, 4, 5, 6, 7, 8];
						const after = values.slice();
						const b = new BufferView(new Uint8Array(values), true);

						const d = b.getView(4, 2);
						viewSW(b, rw, d, 2);

						const a = new BufferView(new Uint8Array(after), true);
						expect(b.compare(a)).toBe(-1);
					});
				});

				it('Fail to write readonly', () => {
					const values = [1, 2, 3, 4];
					const b = new BufferView(
						new Uint8Array(values),
						true,
						0,
						-1,
						true
					);
					const bCopy = b.copy();
					const d = new BufferView(new Uint8Array([5]), true);

					expect(() => {
						viewSW(b, rw, d, 0);
					}).toThrow(readonlyMarked);

					// Check that no changes were made.
					expect(b.compare(bCopy)).toBe(-1);
				});

				it('Bounds checking', () => {
					const b = new BufferView(
						new Uint8Array([1, 2, 3, 4]),
						true
					);
					const bCopy = b.copy();
					const d = new BufferView(
						new Uint8Array([5, 6]),
						true
					);
					const empty = BufferView.fromSize(0, true);

					expect(() => {
						try {
							viewSW(b, rw, empty, b.size + 1);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionRange);
							throw err;
						}
					}).toThrow();

					expect(() => {
						try {
							viewSW(b, rw, d, b.size + 1);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionRange);
							throw err;
						}
					}).toThrow();

					// Check that no changes were made.
					expect(b.compare(bCopy)).toBe(-1);
				});
			});
		}
	});

	describe('int', () => {
		/**
		 * Run for each loop.
		 *
		 * @param bits Bits in the integer.
		 * @param signed Signed or unsigned integer.
		 * @param rw Use read/write or get/set.
		 */
		function each(bits: number, signed: boolean, rw: boolean) {
			const {
				bytes,
				uMax,
				uMin,
				sMax,
				sMin,
				unitsS,
				unitsU,
				bufferUB,
				bufferUL,
				bufferSB,
				bufferSL
			} = createIntUnits(bits);

			const sc = signed ? 'S' : 'U';
			const units = signed ? unitsS : unitsU;
			const bufferB = signed ? bufferSB : bufferUB;
			const bufferL = signed ? bufferSL : bufferUL;
			const intMin = signed ? sMin : uMin;
			const intMax = signed ? sMax : uMax;
			const intMinO = intMin - 1;
			const intMaxO = intMax + 1;

			const methodPreRG = rw ? 'read' : 'get';
			describe(`${methodPreRG}Int${bits}${sc}`, () => {
				it('Expected values', () => {
					const eb = new BufferView(bufferB, false);
					const el = new BufferView(bufferL, true);

					for (let i = 0; i < units.length; i++) {
						const v = units[i];
						const o = i * bytes;

						expect(
							intGR(eb, rw, o, bits, signed)
						).toBe(v);
						expect(
							intGR(el, rw, o, bits, signed)
						).toBe(v);
					}
				});

				it('Bounds checking', () => {
					const ob = BufferView.fromSize(bytes, true);

					for (let i = bytes; i--;) {
						const o = ob.size - i;
						expect(() => {
							try {
								intGR(ob, rw, o, bits, signed);
							}
							catch (err) {
								expect(err.constructor).toBe(ExceptionRange);
								throw err;
							}
						}).toThrow();
					}
				});
			});

			const methodPreWS = rw ? 'write' : 'set';
			describe(`${methodPreWS}Int${bits}${sc}`, () => {
				it('Expected values', () => {
					const size = units.length * bytes;
					const eb = BufferView.fromSize(size, false);
					const el = BufferView.fromSize(size, true);

					for (let i = 0; i < units.length; i++) {
						const v = units[i];
						const o = i * bytes;

						intSW(eb, rw, v, o, bits, signed);
						intSW(el, rw, v, o, bits, signed);
					}

					const bvb = new BufferView(bufferB, false);
					const bvl = new BufferView(bufferL, true);
					expect(eb.compare(bvb)).toBe(-1);
					expect(el.compare(bvl)).toBe(-1);
				});

				it('Fail to write readonly', () => {
					const b = BufferView.fromSize(bytes, true, true);

					expect(() => {
						intSW(b, rw, 1, 0, bits, signed);
					}).toThrow(readonlyMarked);
					expect(() => {
						intSW(b, rw, 1, 0, bits, signed);
					}).toThrow(readonlyMarked);

					const expected = BufferView.fromSize(bytes, true);
					expect(b.compare(expected)).toBe(-1);
				});

				it('Range and value checking', () => {
					const b = BufferView.fromSize(bytes, true);

					for (const v of [intMinO, intMaxO]) {
						expect(() => {
							try {
								intSW(b, rw, v, 0, bits, signed);
							}
							catch (err) {
								expect(err.constructor).toBe(ExceptionRange);
								throw err;
							}
						}).toThrow();
					}

					for (const v of numbersNotInteger) {
						expect(() => {
							try {
								intSW(b, rw, v, 0, bits, signed);
							}
							catch (err) {
								expect(err.constructor).toBe(ExceptionValue);
								throw err;
							}
						}).toThrow();
					}

					for (let i = bytes; i--;) {
						const o = b.size - i;
						expect(() => {
							try {
								intSW(b, rw, 1, o, bits, signed);
							}
							catch (err) {
								expect(err.constructor).toBe(ExceptionRange);
								throw err;
							}
						}).toThrow();
					}
				});
			});
		}

		for (const bits of [8, 16, 32]) {
			for (const signed of [true, false]) {
				for (const read of [false, true]) {
					each(bits, signed, read);
				}
			}
		}
	});

	describe('float', () => {
		/**
		 * Run for each loop.
		 *
		 * @param bits Bits in the float.
		 * @param rw Use read/write or get/set.
		 */
		function each(bits: number, rw: boolean) {
			const {
				bytes,
				units,
				bufferB,
				bufferL
			} = createFloatUnits(bits);

			const methodPreRG = rw ? 'read' : 'get';
			describe(`${methodPreRG}Float${bits}`, () => {
				it('Expected values', () => {
					const eb = new BufferView(bufferB, false);
					const el = new BufferView(bufferL, true);

					for (let i = 0; i < units.length; i++) {
						const v = units[i];
						const o = i * bytes;

						const ebV = floatGR(eb, rw, o, bits);
						const elV = floatGR(el, rw, o, bits);

						if (utilNumberIsNaN(v)) {
							expect(ebV).toBeNaN();
							expect(elV).toBeNaN();
						}
						else {
							expect(ebV).toBe(v);
							expect(elV).toBe(v);
						}
					}
				});

				it('Bounds checking', () => {
					const ob = BufferView.fromSize(bytes, true);

					for (let i = bytes; i--;) {
						const o = ob.size - i;
						expect(() => {
							try {
								floatGR(ob, rw, o, bits);
							}
							catch (err) {
								expect(err.constructor).toBe(ExceptionRange);
								throw err;
							}
						}).toThrow();
					}
				});
			});

			const methodPreWS = rw ? 'write' : 'set';
			describe(`${methodPreWS}Float${bits}`, () => {
				it('Expected values', () => {
					const size = units.length * bytes;
					const eb = BufferView.fromSize(size, false);
					const el = BufferView.fromSize(size, true);

					for (let i = 0; i < units.length; i++) {
						const v = units[i];
						const o = i * bytes;

						floatSW(eb, rw, v, false, o, bits);
						floatSW(el, rw, v, true, o, bits);
					}

					const bvb = new BufferView(bufferB, false);
					const bvl = new BufferView(bufferL, true);
					expect(eb.compare(bvb)).toBe(-1);
					expect(el.compare(bvl)).toBe(-1);
				});

				it('Fail to write readonly', () => {
					const b = BufferView.fromSize(bytes, true, true);

					expect(() => {
						floatSW(b, rw, 1, false, 0, bits);
					}).toThrow(readonlyMarked);
					expect(() => {
						floatSW(b, rw, 1, true, 0, bits);
					}).toThrow(readonlyMarked);

					const expected = BufferView.fromSize(bytes, true);
					expect(b.compare(expected)).toBe(-1);
				});

				it('Range and value checking', () => {
					const b = BufferView.fromSize(bytes, true);

					for (let i = bytes; i--;) {
						const o = b.size - i;
						expect(() => {
							try {
								floatSW(b, rw, 1, false, o, bits);
							}
							catch (err) {
								expect(err.constructor).toBe(ExceptionRange);
								throw err;
							}
						}).toThrow();
					}
				});
			});
		}

		for (const bits of [32, 64]) {
			for (const signed of [true, false]) {
				each(bits, signed);
			}
		}
	});

	describe('readable', () => {
		const values = [1, 2, 3, 4, 5, 6];
		const buffer = new BufferView(new Uint8Array(values), true);

		/**
		 * A mock readable class.
		 */
		class Readable extends Object {

			/**
			 * Test values.
			 */
			public values: number[] = [];

			constructor() {
				super();
			}

			/**
			 * Readable implementation.
			 *
			 * @param view View to read from.
			 */
			public bufferRead(view: BufferView) {
				this.values = [];
				for (let i = 0; i < 4; i++) {
					this.values.push(view.readInt8U());
				}
			}
		}

		it('getReadable', () => {
			const b = buffer.copy();
			const readable = new Readable();
			const size = [0];
			b.getReadable(readable, 1, size);
			expect(readable.values[0]).toBe(values[1]);
			expect(readable.values[1]).toBe(values[2]);
			expect(readable.values[2]).toBe(values[3]);
			expect(readable.values[3]).toBe(values[4]);
			expect(size[0]).toBe(4);
			expect(b.offset).toBe(0);
		});

		it('readReadable', () => {
			const b = buffer.copy();
			const readable = new Readable();
			const size = [0];
			b.offset = 1;
			b.readReadable(readable, size);
			expect(readable.values[0]).toBe(values[1]);
			expect(readable.values[1]).toBe(values[2]);
			expect(readable.values[2]).toBe(values[3]);
			expect(readable.values[3]).toBe(values[4]);
			expect(size[0]).toBe(4);
			expect(b.offset).toBe(5);
		});
	});

	describe('writable', () => {
		const values = [1, 2, 3, 4, 5, 6];
		const buffer = new BufferView(new Uint8Array(values), true);

		/**
		 * A mock writable class.
		 */
		class Writable extends Object {

			/**
			 * Test values.
			 */
			public values: number[] = [];

			constructor() {
				super();
			}

			/**
			 * Writable implementation.
			 *
			 * @param view View to write to.
			 */
			public bufferWrite(view: BufferView) {
				for (let i = 0; i < 4; i++) {
					view.writeInt8U(this.values[i]);
				}
			}
		}

		it('setWritable', () => {
			const b = BufferView.fromSize(6, true);
			b.setInt8U(values[0], 0);
			b.setInt8U(values[5], 5);
			const writable = new Writable();
			writable.values = values.slice(1, 5);
			const size = [0];
			b.setWritable(writable, 1, size);
			expect(b.compare(buffer)).toBe(-1);
			expect(size[0]).toBe(4);
			expect(b.offset).toBe(0);
		});

		it('writeWritable', () => {
			const b = BufferView.fromSize(6, true);
			b.setInt8U(values[0], 0);
			b.setInt8U(values[5], 5);
			const writable = new Writable();
			writable.values = values.slice(1, 5);
			const size = [0];
			b.offset = 1;
			b.writeWritable(writable, size);
			expect(b.compare(buffer)).toBe(-1);
			expect(size[0]).toBe(4);
			expect(b.offset).toBe(5);
		});
	});
});
