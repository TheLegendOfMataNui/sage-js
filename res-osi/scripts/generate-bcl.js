// Used to procedurally generate/update instruction BCL classes.

'use strict';

const fs = require('fs');
const path = require('path');

const spec = require('./generate-bcl/spec.json');

const outdir = path.join(__dirname, '../src/instruction/bcl');

// eslint-disable-next-line no-sync
const sourceTemplate = fs.readFileSync(
	path.join(__dirname, 'generate-bcl/template.ts.tpl'),
	'utf8'
);

function arrayToLines(arr, indent) {
	arr = arr.map(v => indent + v);
	if (arr.length) {
		arr = ['', ...arr];
	}
	return arr.join('\n');
}

function template(opcode, name, argTypes) {
	const importsCore = new Set(['BufferView', 'PrimitiveInt8U']);
	const importsOther = new Set();
	let size = 1;
	const argConstructors = [];
	const copies = [];
	let reads = [];
	let writes = [];
	const unknowns = [];

	argTypes.forEach((arg, i) => {
		let rw = true;
		switch (arg) {
			case 'i8s': {
				size += 1;
				argConstructors.push('PrimitiveInt8S');
				break;
			}
			case 'i8u': {
				size += 1;
				argConstructors.push('PrimitiveInt8U');
				break;
			}
			case 'i16s': {
				size += 2;
				argConstructors.push('PrimitiveInt16S');
				break;
			}
			case 'i16u': {
				size += 2;
				argConstructors.push('PrimitiveInt16U');
				break;
			}
			case 'int24s': {
				size += 3;
				argConstructors.push(null);
				unknowns.push('int24s');
				rw = false;
				break;
			}
			case 'int24u': {
				size += 3;
				argConstructors.push(null);
				unknowns.push('int24u');
				rw = false;
				break;
			}
			case 'i32s': {
				size += 4;
				argConstructors.push('PrimitiveInt32S');
				break;
			}
			case 'i32u': {
				size += 4;
				argConstructors.push('PrimitiveInt32U');
				break;
			}
			case 'f32': {
				size += 4;
				argConstructors.push('PrimitiveFloat32');
				break;
			}
			case 'f64': {
				size += 8;
				argConstructors.push('PrimitiveFloat64');
				break;
			}
			default: {
				throw new Error(`Unknown type: ${arg}`);
			}
		}
		if (rw) {
			reads.push(`this.arg${i} = view.readReadableNew(this.arg${i});`);
			writes.push(`view.writeWritable(this.arg${i});`);
		}
		copies.push(`r.arg${i} = this.arg${i};`);
	});

	if (unknowns.length) {
		importsOther.add(
			'import {ExceptionUnimplemented} ' +
			"from '../../exception/unimplemented';"
		);
		const msg = `'Unknown implementations: ${unknowns.join(', ')}'`;
		const err = `throw new ExceptionUnimplemented(${msg});`;
		reads = [err];
		writes = [err];
	}

	argConstructors.forEach(Constructor => {
		if (Constructor) {
			importsCore.add(Constructor);
		}
	});

	const argsstatic = argConstructors.map((v, i) => `	/**
	 * Argument ${i}.
	 */
	public static readonly ARG${i} = ${v};
`);

	const args = argConstructors
		.map(v => (v ? `new ${v}()` : `${v}`))
		.map((v, i) => `	/**
	 * Argument ${i}.
	 */
	public arg${i} = ${v};
`);

	const variables = {
		importother: arrayToLines([...importsOther].sort(), ''),
		importscore: [...importsCore]
			.sort()
			.map(s => `\t${s}`)
			.join(',\n'),
		opcodehex:
			(opcode < 0x10 ? '0' : '') + opcode.toString(16).toUpperCase(),
		size,
		name,
		argc: argTypes.length,
		argsstatic: arrayToLines(argsstatic, ''),
		args: arrayToLines(args, ''),
		copies: arrayToLines(copies, '\t\t'),
		reads: arrayToLines(reads, '\t\t'),
		writes: arrayToLines(writes, '\t\t')
	};
	const src = sourceTemplate
		.replace(/\$\{([^}]+)\}/g, (m, g1) => variables[g1]);

	const mn = name.toLowerCase();
	const fn = `${mn}.ts`;

	// eslint-disable-next-line no-sync
	fs.writeFileSync(path.join(outdir, fn), src, 'utf8');

	// eslint-disable-next-line no-console
	console.log(`export * from './${mn}';`);
}

function main() {
	spec.forEach(data => {
		template(+`0x${data[0]}`, data[1], data[2]);
	});
}
main();
