import {typed} from './typed';
import {
	PrimitiveInt16S,
	PrimitiveInt16U,
	PrimitiveInt32U,
	PrimitiveStringP8N,
	BufferView
} from '@sage-js/core';

import {ClassDefinitionProperty} from './classdefinitionproperty';
import {ClassDefinitionMethod} from './classdefinitionmethod';

import {
	InstructionBCLReturn
} from './instruction/bcl/return';

import {
	InstructionBCLPushConstantString
} from './instruction/bcl/pushconstantstring';
import {
	InstructionAbstractPushConstantStringString
} from './instruction/abstract/pushconstantstringstring';

import {
	InstructionBCLGetThisMemberFunction
} from './instruction/bcl/getthismemberfunction';
import {
	InstructionBCLGetThisMemberValue
} from './instruction/bcl/getthismembervalue';
import {
	InstructionBCLSetThisMemberValue
} from './instruction/bcl/setthismembervalue';
import {
	InstructionBCLGetMemberFunction
} from './instruction/bcl/getmemberfunction';
import {
	InstructionBCLGetMemberValue
} from './instruction/bcl/getmembervalue';
import {
	InstructionBCLSetMemberValue
} from './instruction/bcl/setmembervalue';
import {
	InstructionAbstractGetThisMemberFunctionString
} from './instruction/abstract/getthismemberfunctionstring';
import {
	InstructionAbstractGetThisMemberValueString
} from './instruction/abstract/getthismembervaluestring';
import {
	InstructionAbstractSetThisMemberValueString
} from './instruction/abstract/setthismembervaluestring';
import {
	InstructionAbstractGetMemberFunctionString
} from './instruction/abstract/getmemberfunctionstring';
import {
	InstructionAbstractGetMemberValueString
} from './instruction/abstract/getmembervaluestring';
import {
	InstructionAbstractSetMemberValueString
} from './instruction/abstract/setmembervaluestring';

// GetVariableValue
import {
	InstructionBCLGetVariableValue
} from './instruction/bcl/getvariablevalue';
import {
	InstructionAbstractGetVariableValueGlobalString
} from './instruction/abstract/getvariablevalueglobalstring';

// SetVariableValue
import {
	InstructionBCLSetVariableValue
} from './instruction/bcl/setvariablevalue';
import {
	InstructionAbstractSetVariableValueGlobalString
} from './instruction/abstract/setvariablevalueglobalstring';

// CreateObject
import {
	InstructionBCLCreateObject
} from './instruction/bcl/createobject';
import {
	InstructionAbstractCreateObjectString
} from './instruction/abstract/createobjectstring';

import {OSI} from './osi';

interface IClass {
	/**
	 * Unit name.
	 */
	name: string;

	/**
	 * Unit properties.
	 */
	properties: string[];

	/**
	 * Unit methods.
	 */
	methods: string[];

	/**
	 * Unit children.
	 */
	children: IClass[];
}

interface IClassExpect {
	/**
	 * Unit name.
	 */
	name: string;

	/**
	 * Unit properties.
	 */
	properties: {[key: number]: null};

	/**
	 * Unit methods.
	 */
	methods: {[key: number]: number};
}

const dummyClasses = [
	{
		name: 'animal',
		properties: ['alive'],
		methods: ['kill'],
		children: [
			{
				name: 'mammal',
				properties: ['legs'],
				methods: ['speak'],
				children: [
					{
						name: 'dog',
						properties: ['spots'],
						methods: ['speak', 'fetch'],
						children: []
					},
					{
						name: 'monkey',
						properties: ['see'],
						methods: ['speak', 'do'],
						children: []
					}
				]
			}
		]
	},
	{
		name: 'plant',
		properties: ['alive'],
		methods: ['kill'],
		children: [
			{
				name: 'tree',
				properties: [],
				methods: [],
				children: []
			},
			{
				name: 'flower',
				properties: [],
				methods: [],
				children: []
			}
		]
	}
];

/**
 * Create ot get a symbol index.
 *
 * @param osi OSI object.
 * @param name Symbol string.
 * @return Symbol index.
 */
function createOrGetSymbol(osi: OSI, name: string) {
	const entries = osi.header.symbolTable.entries;
	for (let i = 0; i < entries.length; i++) {
		if (name === entries[i].value) {
			return i;
		}
	}
	const r = entries.length;
	entries.push(new PrimitiveStringP8N(name));
	return r;
}

/**
 * Create dummy test classes.
 *
 * @param osi OSI object.
 * @param classes Classes list.
 */
function createClasses(osi: OSI, classes: IClass[]) {
	const parents = new Map<IClass, IClass | null>();

	const lineage = (c: IClass) => {
		const r = [c];
		let cc: IClass | null = c;
		while (cc) {
			cc = parents.get(cc) || null;
			if (cc) {
				r.push(cc);
			}
		}
		return r;
	};

	const flatMethods = (classes: IClass[]) => {
		const r = new Map<string, PrimitiveInt32U>();
		for (let i = classes.length; i--;) {
			const cc = classes[i];
			const ms = methods.get(cc) || new Map();
			for (const [k, v] of ms) {
				r.set(k, v);
			}
		}
		return r;
	};

	const flatProperties = (classes: IClass[]) => {
		const r = new Set<string>();
		for (let i = classes.length; i--;) {
			const cc = classes[i];
			for (const p of cc.properties) {
				r.add(p);
			}
		}
		return r;
	};

	const list: IClass[] = [];
	const queue = [...classes];
	while (queue.length) {
		const cl = queue.shift();
		if (!cl) {
			break;
		}
		parents.set(cl, parents.get(cl) || null);
		queue.unshift(...cl.children);
		list.push(cl);
		for (const c of cl.children) {
			parents.set(c, cl);
		}
	}

	const methods = new Map<IClass, Map<string, PrimitiveInt32U>>();
	for (const cl of list) {
		const ms = new Map<string, PrimitiveInt32U>();

		const sub = osi.subroutines.addNew();
		sub.subroutine.instructions.push(new InstructionBCLReturn());
		ms.set(cl.name, sub.offset);

		for (const method of cl.methods) {
			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(new InstructionBCLReturn());
			ms.set(method, sub.offset);
		}

		methods.set(cl, ms);
	}

	for (const c of list) {
		const lin = lineage(c);
		const meths = flatMethods(lin);
		const props = flatProperties(lin);

		const cstruct = new osi.header.classTable.ClassDefinition();
		const cname = new PrimitiveStringP8N(c.name);

		for (const p of props) {
			const cp = new ClassDefinitionProperty();
			cp.symbol = new PrimitiveInt16U(createOrGetSymbol(osi, p));
			cstruct.classPropertyTable.entries.push(cp);
		}
		for (const [m, offset] of meths) {
			const cm = new ClassDefinitionMethod();
			cm.symbol = new PrimitiveInt16U(createOrGetSymbol(osi, m));
			cm.offset = offset;
			cstruct.classMethodTable.entries.push(cm);
		}

		osi.header.classTable.entries.push({
			name: cname,
			structure: cstruct
		});
	}

	return parents;
}

/**
 * List classes in a simple format suitable to check equality.
 *
 * @param osi OSI object.
 * @return Resulting list.
 */
function listClassesExpect(osi: OSI) {
	const r: IClassExpect[] = [];
	for (const entry of osi.header.classTable.entries) {
		const info: IClassExpect = {
			name: entry.name.value,
			properties: {},
			methods: {}
		};
		const {properties, methods} = info;
		for (const p of entry.structure.classPropertyTable.entries) {
			const s = p.symbol.value;
			if (s in properties) {
				throw new Error(`Unexpeced duplicate property: ${s}`);
			}
			properties[s] = null;
		}
		for (const m of entry.structure.classMethodTable.entries) {
			const s = m.symbol.value;
			if (s in methods) {
				throw new Error(`Unexpeced duplicate method: ${s}`);
			}
			methods[s] = m.offset.value;
		}
		r.push(info);
	}
	return r;
}

describe('OSI', () => {
	describe('transformAbstractStrings*', () => {
		it('PushConstantString', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const strp = new PrimitiveStringP8N('hello world');

			osi.header.stringTable.entries.push(strp);

			const inst = new InstructionBCLPushConstantString();
			inst.arg0 = new PrimitiveInt16U(0);

			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(inst);

			osi.transformAbstractStringAdd();

			const instAbs = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionAbstractPushConstantStringString
			);
			expect(instAbs.arg0.value).toBe(strp.value);

			osi.transformAbstractStringRemove();

			const instBCL = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLPushConstantString
			);
			expect(instBCL.arg0.value).toBe(0);

			osi.transformAbstractStringAdd();
			osi.header.stringTable.entries = [];
			osi.transformAbstractStringRemove();

			const addedStr = osi.header.stringTable.entries[0];
			if (addedStr) {
				expect(addedStr.value).toBe(strp.value);
			}
			else {
				expect(addedStr).toBeTruthy();
			}
		});
	});

	describe('transformAbstractSymbols*', () => {
		const InstructionBCLs = [
			InstructionBCLGetThisMemberFunction,
			InstructionBCLGetThisMemberValue,
			InstructionBCLSetThisMemberValue,
			InstructionBCLGetMemberFunction,
			InstructionBCLGetMemberValue,
			InstructionBCLSetMemberValue
		];
		const InstructionAbstracts = [
			InstructionAbstractGetThisMemberFunctionString,
			InstructionAbstractGetThisMemberValueString,
			InstructionAbstractSetThisMemberValueString,
			InstructionAbstractGetMemberFunctionString,
			InstructionAbstractGetMemberValueString,
			InstructionAbstractSetMemberValueString
		];
		for (let i = 0; i < InstructionBCLs.length; i++) {
			const InstructionBCL = InstructionBCLs[i];
			const InstructionAbstract = InstructionAbstracts[i];

			it(InstructionBCL.NAME, () => {
				const osi = new OSI();
				osi.header.versionMajor = new PrimitiveInt16S(4);
				osi.header.versionMinor = new PrimitiveInt16S(1);
				osi.header.initVersion();

				const strp = new PrimitiveStringP8N('some_symbol');

				osi.header.symbolTable.entries.push(strp);

				const inst = new InstructionBCL();
				inst.arg0 = new PrimitiveInt16U(0);

				const sub = osi.subroutines.addNew();
				sub.subroutine.instructions.push(inst);

				osi.transformAbstractSymbolAdd();

				const instAbs = typed.tryCast(
					sub.subroutine.instructions[0],
					InstructionAbstract
				);
				expect(instAbs.arg0.value).toBe(strp.value);

				osi.transformAbstractSymbolRemove();

				const instBCL = typed.tryCast(
					sub.subroutine.instructions[0],
					InstructionBCL
				);
				expect(instBCL.arg0.value).toBe(0);

				osi.transformAbstractSymbolAdd();
				osi.header.symbolTable.entries = [];
				osi.transformAbstractSymbolRemove();

				const addedStr = osi.header.symbolTable.entries[0];
				if (addedStr) {
					expect(addedStr.value).toBe(strp.value);
				}
				else {
					expect(addedStr).toBeTruthy();
				}
			});
		}
	});

	describe('transformAbstractGlobals*', () => {
		it('GetVariableValue (global)', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const strp = new PrimitiveStringP8N('globalvar');
			const strp2 = new PrimitiveStringP8N('globalvar');
			const index = new PrimitiveInt16U(0x8000);

			osi.header.globalTable.entries.push(strp, strp2);

			const inst = new InstructionBCLGetVariableValue();
			inst.arg0 = index;

			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(inst);

			osi.transformAbstractGlobalAdd();

			const instAbs = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionAbstractGetVariableValueGlobalString
			);
			expect(instAbs.arg0.value).toBe(strp.value);

			osi.transformAbstractGlobalRemove();

			const instBCL = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLGetVariableValue
			);
			expect(instBCL.arg0.value).toBe(index.value);

			osi.transformAbstractGlobalAdd();
			osi.header.globalTable.entries = [];
			osi.transformAbstractGlobalRemove();

			const addedStr = osi.header.globalTable.entries[0];
			if (addedStr) {
				expect(addedStr.value).toBe(strp.value);
			}
			else {
				expect(addedStr).toBeTruthy();
			}
		});

		it('GetVariableValue (local)', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const index = new PrimitiveInt16U(0);

			const inst = new InstructionBCLGetVariableValue();
			inst.arg0 = index;

			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(inst);

			osi.transformAbstractGlobalAdd();

			const instBCL1 = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLGetVariableValue
			);
			expect(instBCL1.arg0.value).toBe(index.value);

			osi.transformAbstractGlobalRemove();

			const instBCL2 = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLGetVariableValue
			);
			expect(instBCL2.arg0.value).toBe(index.value);
		});

		it('SetVariableValue (global)', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const strp = new PrimitiveStringP8N('globalvar');
			const strp2 = new PrimitiveStringP8N('globalvar');
			const index = new PrimitiveInt16U(0x8000);

			osi.header.globalTable.entries.push(strp, strp2);

			const inst = new InstructionBCLSetVariableValue();
			inst.arg0 = index;

			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(inst);

			osi.transformAbstractGlobalAdd();

			const instAbs = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionAbstractSetVariableValueGlobalString
			);
			expect(instAbs.arg0.value).toBe(strp.value);

			osi.transformAbstractGlobalRemove();

			const instBCL = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLSetVariableValue
			);
			expect(instBCL.arg0.value).toBe(index.value);

			osi.transformAbstractGlobalAdd();
			osi.header.globalTable.entries = [];
			osi.transformAbstractGlobalRemove();

			const addedStr = osi.header.globalTable.entries[0];
			if (addedStr) {
				expect(addedStr.value).toBe(strp.value);
			}
			else {
				expect(addedStr).toBeTruthy();
			}
		});

		it('SetVariableValue (local)', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const index = new PrimitiveInt16U(0);

			const inst = new InstructionBCLSetVariableValue();
			inst.arg0 = index;

			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(inst);

			osi.transformAbstractGlobalAdd();

			const instBCL1 = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLSetVariableValue
			);
			expect(instBCL1.arg0.value).toBe(index.value);

			osi.transformAbstractGlobalRemove();

			const instBCL2 = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLSetVariableValue
			);
			expect(instBCL2.arg0.value).toBe(index.value);
		});
	});

	describe('transformAbstractClass*', () => {
		it('CreateObject', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const cstruct = new osi.header.classTable.ClassDefinition();
			const cname = new PrimitiveStringP8N('classical');
			osi.header.classTable.entries.push({
				name: cname,
				structure: cstruct
			});

			const inst = new InstructionBCLCreateObject();
			inst.arg0 = new PrimitiveInt16U(0);

			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(inst);

			osi.transformAbstractClassAdd();

			const instAbs = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionAbstractCreateObjectString
			);
			expect(instAbs.arg0.value).toBe(cname.value);

			osi.transformAbstractClassRemove();

			const instBCL = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLCreateObject
			);
			expect(instBCL.arg0.value).toBe(0);
		});
	});

	describe('transformClassExtends*', () => {
		it('Hierarchy', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const parents = createClasses(osi, dummyClasses);
			const parentsByName = new Map<string, IClass | null>();
			for (const [k, v] of parents) {
				parentsByName.set(k.name, v);
			}

			osi.updateOffsets();

			const expected = listClassesExpect(osi);

			osi.transformClassExtendsAdd();

			for (const {name, structure} of osi.header.classTable.entries) {
				const parent = parentsByName.get(name.value);
				if (parent === undefined) {
					throw new Error('Unexpected undefined');
				}
				if (parent) {
					expect(structure.extends).toBeTruthy();
				}
				else {
					expect(structure.extends).toBeNull();
				}
			}

			osi.transformClassExtendsRemove();

			for (const {structure} of osi.header.classTable.entries) {
				expect(structure.extends).toBeNull();
			}

			const resulted = listClassesExpect(osi);

			expect(resulted).toEqual(expected);
		});

		it('Size', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			createClasses(osi, dummyClasses);
			osi.updateOffsets();

			const sizeExpected = osi.size;

			osi.transformClassExtendsAdd();

			expect(osi.size).toBe(sizeExpected);

			osi.transformClassExtendsRemove();

			expect(osi.size).toBe(sizeExpected);
		});

		it('Read/Write', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			createClasses(osi, dummyClasses);
			osi.updateOffsets();
			osi.transformClassExtendsAdd();
			osi.transformClassExtendsRemove();

			const size = osi.size;
			const bvExpected = BufferView.fromSize(size, true);

			osi.transformClassExtendsAdd();
			bvExpected.writeWritable(osi);

			const bvActual = BufferView.fromSize(size, true);
			bvActual.writeWritable(osi);

			expect(bvActual.compare(bvExpected)).toBe(-1);
		});
	});
});
