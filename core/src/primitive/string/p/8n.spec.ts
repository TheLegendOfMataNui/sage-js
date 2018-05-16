import {
	utilStringRepeat,
	utilAsciiToHex,
	utilCharCodeToHex
} from '../../../util';
import {BufferView} from '../../../bufferview';
import {ExceptionValue} from '../../../exception/value';
import {ExceptionRange} from '../../../exception/range';
import {PrimitiveStringP8N} from './8n';

const unitsGood = [
	'',
	'Hello World!',
	utilStringRepeat('a', 255),
	'\x01\xFF'
];
const unitsErrorValue = [
	'\x00',
	'\xFF\x00'
];
const unitsErrorRange = [
	utilStringRepeat('a', 256)
];

describe('PrimitivePString8N', () => {
	describe('constructor', () => {
		describe('passes', () => {
			for (const v of unitsGood) {
				it(JSON.stringify(v), () => {
					const pstr = new PrimitiveStringP8N(v);
					expect(pstr.value).toBe(v);
					expect(pstr.size).toBe(v.length + 2);
				});
			}
		});

		describe('error value', () => {
			for (const v of unitsErrorValue) {
				it(JSON.stringify(v), () => {
					expect(() => {
						try {
							// tslint:disable-next-line: no-unused-expression
							new PrimitiveStringP8N(v);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionValue);
							throw err;
						}
					}).toThrow();
				});
			}
		});

		describe('error range', () => {
			for (const v of unitsErrorRange) {
				it(JSON.stringify(v), () => {
					expect(() => {
						try {
							// tslint:disable-next-line: no-unused-expression
							new PrimitiveStringP8N(v);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionRange);
							throw err;
						}
					}).toThrow();
				});
			}
		});
	});

	describe('getBuffer/readBuffer', () => {
		describe('passes', () => {
			for (const v of unitsGood) {
				it(JSON.stringify(v), () => {
					const b = BufferView.fromHex([
						'00',
						utilCharCodeToHex(v.length),
						utilAsciiToHex(v),
						'0000'
					].join(''), true);

					const sizeG = [0];
					const pstrG = PrimitiveStringP8N.getBuffer(b, 1, sizeG);
					expect(pstrG.value).toBe(v);
					expect(pstrG.size).toBe(v.length + 2);
					expect(sizeG[0]).toBe(v.length + 2);
					expect(b.offset).toBe(0);

					b.offset = 1;
					const sizeR = [0];
					const pstrR = PrimitiveStringP8N.readBuffer(b, sizeR);
					expect(pstrR.value).toBe(v);
					expect(pstrR.size).toBe(v.length + 2);
					expect(sizeR[0]).toBe(v.length + 2);
					expect(b.remaining).toBe(1);
				});
			}
		});

		describe('error value', () => {
			for (const v of unitsErrorValue) {
				it(JSON.stringify(v), () => {
					const b = BufferView.fromHex([
						'00',
						utilCharCodeToHex(v.length),
						utilAsciiToHex(v),
						'00'
					].join(''), true);

					const sizeG = [0];
					expect(() => {
						try {
							PrimitiveStringP8N.getBuffer(b, 1, sizeG);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionValue);
							throw err;
						}
					}).toThrow();
					expect(sizeG[0]).toBe(0);
					expect(b.offset).toBe(0);

					b.offset = 1;
					const sizeR = [0];
					expect(() => {
						try {
							PrimitiveStringP8N.getBuffer(b, 1, sizeR);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionValue);
							throw err;
						}
					}).toThrow();
					expect(sizeR[0]).toBe(0);
					expect(b.offset).toBe(1);
				});
			}
		});

		describe('error value null terminated', () => {
			for (const v of unitsGood) {
				it(JSON.stringify(v), () => {
					const b = BufferView.fromHex([
						'00',
						utilCharCodeToHex(v.length),
						utilAsciiToHex(v),
						'01'
					].join(''), true);

					let size = [0];
					expect(() => {
						try {
							PrimitiveStringP8N.getBuffer(b, 1, size);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionValue);
							throw err;
						}
					}).toThrow();
					expect(size[0]).toBe(0);
					expect(b.offset).toBe(0);

					b.offset = 1;
					size = [0];
					expect(() => {
						try {
							PrimitiveStringP8N.getBuffer(b, 1, size);
						}
						catch (err) {
							expect(err.constructor).toBe(ExceptionValue);
							throw err;
						}
					}).toThrow();
					expect(size[0]).toBe(0);
					expect(b.offset).toBe(1);
				});
			}
		});
	});

	describe('setBuffer/setWritable', () => {
		describe('passes', () => {
			for (const v of unitsGood) {
				it(JSON.stringify(v), () => {
					const pstr = new PrimitiveStringP8N(v);
					const bS = BufferView.fromSize(pstr.size + 2, true);
					const bW = BufferView.fromSize(pstr.size + 2, true);

					const sizeS = [0];
					bS.setWritable(pstr, 1, sizeS);
					expect(PrimitiveStringP8N.getBuffer(bS, 1).value).toBe(v);
					expect(sizeS[0]).toBe(pstr.size);
					expect(bS.offset).toBe(0);

					bW.offset = 1;
					const sizeW = [0];
					bW.writeWritable(pstr, sizeW);
					expect(PrimitiveStringP8N.getBuffer(bW, 1).value).toBe(v);
					expect(sizeW[0]).toBe(pstr.size);
					expect(bW.remaining).toBe(1);
				});
			}
		});
	});
});
