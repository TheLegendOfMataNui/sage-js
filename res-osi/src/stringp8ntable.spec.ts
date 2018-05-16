import {
	BufferView,
	PrimitiveStringP8N
} from '@sage-js/core';
import {StringP8NTable} from './stringp8ntable';

const strings = [
	'hello world',
	'\x01\xFF'
];
const pstrings = strings.map(s => new PrimitiveStringP8N(s));
const pstringSizeTotal = pstrings.reduce((r, p) => r + p.size, 0);
const tableBuffer = BufferView.fromSize(pstringSizeTotal + 2, true);
tableBuffer.writeInt16U(strings.length);
pstrings.forEach(p => {
	tableBuffer.writeWritable(p);
});

describe('StringP8NTable', () => {
	describe('constructor', () => {
		it('passes', () => {
			const table = new StringP8NTable();
			expect(table.entries.length).toBe(0);
		});
	});

	describe('getReadable/readReadable', () => {
		it('passes', () => {
			const b = BufferView.concat([
				BufferView.fromSize(1, true),
				tableBuffer,
				BufferView.fromSize(1, true)
			], true);

			const sizeG = [0];
			const tableGet = new StringP8NTable();
			b.getReadable(tableGet, 1, sizeG);
			expect(sizeG[0]).toBe(tableBuffer.size);
			expect(b.offset).toBe(0);

			b.offset = 1;
			const sizeW = [0];
			const tableRead = new StringP8NTable();
			b.readReadable(tableRead, sizeW);
			expect(sizeW[0]).toBe(tableBuffer.size);
			expect(b.remaining).toBe(1);
		});
	});

	describe('setWritable/writeWritable', () => {
		it('passes', () => {
			const table = new StringP8NTable();
			table.entries = pstrings;

			const bS = BufferView.fromSize(table.size + 2, true);
			const bW = BufferView.fromSize(table.size + 2, true);
			const bSV = bS.getView(bS.size - 2, 1);
			const bWV = bW.getView(bW.size - 2, 1);

			const sizeS = [0];
			bS.setWritable(table, 1, sizeS);
			expect(sizeS[0]).toBe(table.size);
			expect(bS.offset).toBe(0);
			expect(bSV.compare(tableBuffer)).toBe(-1);

			bW.offset = 1;
			const sizeW = [0];
			bW.writeWritable(table, sizeW);
			expect(sizeW[0]).toBe(table.size);
			expect(bW.remaining).toBe(1);
			expect(bWV.compare(tableBuffer)).toBe(-1);
		});
	});
});
