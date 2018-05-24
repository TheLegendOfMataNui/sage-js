import {
	Structure,
	BufferView,
	PrimitiveInt16U,
	PrimitiveInt32S,
	PrimitiveInt32U,
	PrimitiveStringP8N,
	utilNumberToHex
} from '@sage-js/core';
import {
	StringP8NTable
} from './stringp8ntable';
import {ITransformString} from './types';
import {typed} from './typed';
import {ExceptionInternal} from './exception/internal';
import {ExceptionInvalid} from './exception/invalid';
import {Header} from './header';
import {FunctionDefinition} from './functiondefinition';
import {ClassDefinitionMethod} from './classdefinitionmethod';
import {Subroutine} from './subroutine';
import {SubroutineTable} from './subroutinetable';
import {Instruction} from './instruction/class';
import {InstructionBCL} from './instruction/bcl/class';
import {InstructionAbstract} from './instruction/abstract/class';

// Branching and jumping instructions.
import {InstructionBCLJumpRelative} from './instruction/bcl/jumprelative';
import {InstructionBCLPushConstanti32} from './instruction/bcl/pushconstanti32';
import {InstructionAbstractJumpTarget} from './instruction/abstract/jumptarget';
import {
	InstructionAbstractPushConstanti32JumpTarget
} from './instruction/abstract/pushconstanti32jumptarget';

// PushConstantString
import {
	InstructionBCLPushConstantString
} from './instruction/bcl/pushconstantstring';
import {
	InstructionAbstractPushConstantStringString
} from './instruction/abstract/pushconstantstringstring';

// GetGameVariable
import {
	InstructionBCLGetGameVariable
} from './instruction/bcl/getgamevariable';
import {
	InstructionAbstractGetGameVariableString
} from './instruction/abstract/getgamevariablestring';

// SetGameVariable
import {
	InstructionBCLSetGameVariable
} from './instruction/bcl/setgamevariable';
import {
	InstructionAbstractSetGameVariableString
} from './instruction/abstract/setgamevariablestring';

// CallGameFunction
import {
	InstructionBCLCallGameFunction
} from './instruction/bcl/callgamefunction';
import {
	InstructionAbstractCallGameFunctionString
} from './instruction/abstract/callgamefunctionstring';

// CallGameFunctionFromString
import {
	InstructionBCLCallGameFunctionFromString
} from './instruction/bcl/callgamefunctionfromstring';
import {
	InstructionAbstractCallGameFunctionFromStringString
} from './instruction/abstract/callgamefunctionfromstringstring';

// GetThisMemberFunction
import {
	InstructionBCLGetThisMemberFunction
} from './instruction/bcl/getthismemberfunction';
import {
	InstructionAbstractGetThisMemberFunctionString
} from './instruction/abstract/getthismemberfunctionstring';

// GetThisMemberValue
import {
	InstructionBCLGetThisMemberValue
} from './instruction/bcl/getthismembervalue';
import {
	InstructionAbstractGetThisMemberValueString
} from './instruction/abstract/getthismembervaluestring';

// SetThisMemberValue
import {
	InstructionBCLSetThisMemberValue
} from './instruction/bcl/setthismembervalue';
import {
	InstructionAbstractSetThisMemberValueString
} from './instruction/abstract/setthismembervaluestring';

// GetMemberFunction
import {
	InstructionBCLGetMemberFunction
} from './instruction/bcl/getmemberfunction';
import {
	InstructionAbstractGetMemberFunctionString
} from './instruction/abstract/getmemberfunctionstring';

// GetMemberValue
import {
	InstructionBCLGetMemberValue
} from './instruction/bcl/getmembervalue';
import {
	InstructionAbstractGetMemberValueString
} from './instruction/abstract/getmembervaluestring';

// SetMemberValue
import {
	InstructionBCLSetMemberValue
} from './instruction/bcl/setmembervalue';
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

const InstructionStrings: ITransformString[] = [
	{
		BCL: InstructionBCLPushConstantString,
		ABS: InstructionAbstractPushConstantStringString,
		args: new Set([0])
	},
	{
		BCL: InstructionBCLGetGameVariable,
		ABS: InstructionAbstractGetGameVariableString,
		args: new Set([0, 1])
	},
	{
		BCL: InstructionBCLSetGameVariable,
		ABS: InstructionAbstractSetGameVariableString,
		args: new Set([0, 1])
	},
	{
		BCL: InstructionBCLCallGameFunction,
		ABS: InstructionAbstractCallGameFunctionString,
		args: new Set([0, 1]),
	},
	{
		BCL: InstructionBCLCallGameFunctionFromString,
		ABS: InstructionAbstractCallGameFunctionFromStringString,
		args: new Set([0])
	}
];

const InstructionSymbols: ITransformString[] = [
	{
		BCL: InstructionBCLGetThisMemberFunction,
		ABS: InstructionAbstractGetThisMemberFunctionString,
		args: new Set([0])
	},
	{
		BCL: InstructionBCLGetThisMemberValue,
		ABS: InstructionAbstractGetThisMemberValueString,
		args: new Set([0])
	},
	{
		BCL: InstructionBCLSetThisMemberValue,
		ABS: InstructionAbstractSetThisMemberValueString,
		args: new Set([0])
	},
	{
		BCL: InstructionBCLGetMemberFunction,
		ABS: InstructionAbstractGetMemberFunctionString,
		args: new Set([0])
	},
	{
		BCL: InstructionBCLGetMemberValue,
		ABS: InstructionAbstractGetMemberValueString,
		args: new Set([0])
	},
	{
		BCL: InstructionBCLSetMemberValue,
		ABS: InstructionAbstractSetMemberValueString,
		args: new Set([0])
	}
];

const InstructionGlobals: ITransformString[] = [
	{
		BCL: InstructionBCLGetVariableValue,
		ABS: InstructionAbstractGetVariableValueGlobalString,
		args: new Set([0])
	},
	{
		BCL: InstructionBCLSetVariableValue,
		ABS: InstructionAbstractSetVariableValueGlobalString,
		args: new Set([0])
	}
];

/**
 * Find the previous offset BCL instruction.
 *
 * @param instructions Instruction list.
 * @param index Starting index.
 * @return Instruction, null, or throw.
 */
function findJumpOffsetBCL(
	instructions: Instruction[],
	index: number
) {
	for (let i = index; i--;) {
		const instruction = instructions[i];
		const abs = typed.cast(instruction, InstructionAbstract);
		if (abs) {
			if (typed.cast(abs, InstructionAbstractJumpTarget)) {
				break;
			}
			continue;
		}

		const bcl = typed.cast(instruction, InstructionBCL);
		if (!bcl) {
			continue;
		}
		const push = typed.cast(bcl, InstructionBCLPushConstanti32);
		if (!push) {
			throw new ExceptionInvalid(
				`Expected ${InstructionBCLPushConstanti32.NAME}`
			);
		}
		return push;
	}
	return null;
}

/**
 * OSI class.
 */
export class OSI extends Structure {

	/**
	 * File header.
	 */
	public header = new Header();

	/**
	 * Subroutine table.
	 */
	public subroutines = new SubroutineTable();

	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.header = this.header.copy();
		r.subroutines = this.subroutines.copy();
		return r;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		return this.header.size + this.subroutines.size;
	}

	/**
	 * Update the offsets in the subroutines, and their mappings in the header.
	 * If any subroutines are empty, this will throw without changes.
	 * This does not update jump relatives, which should be abstracted.
	 *
	 * @param base Base offset.
	 */
	public updateOffsets() {
		// Assmeble mappings from functions and methods to subroutines.
		const functions: Map<FunctionDefinition, Subroutine> =
			new Map();
		const methods: Map<ClassDefinitionMethod, Subroutine> =
			new Map();

		for (const func of this.header.functionTable.entries) {
			const sub = this.subroutines.getByOffset(func.offset);
			if (!sub) {
				const offsetHex = utilNumberToHex(func.offset.value);
				const name = func.name.value;
				throw new ExceptionInvalid(
					`Invalid function offset: ${name}: 0x${offsetHex}`
				);
			}
			functions.set(func, sub.subroutine);
		}
		for (const {structure, name} of this.header.classTable.entries) {
			for (const method of structure.classMethodTable.entries) {
				const sub = this.subroutines.getByOffset(method.offset);
				if (!sub) {
					const offsetHex = utilNumberToHex(method.offset.value);
					const symbol = method.symbol.value;
					const methodID = `${name}.{${symbol}}`;
					throw new ExceptionInvalid(
						`Invalid method offset: ${methodID}: 0x${offsetHex}`
					);
				}
				methods.set(method, sub.subroutine);
			}
		}

		// Calculate correct subroutine offset, and update.
		const subroutinesOffset = new PrimitiveInt32U(this.header.size);
		this.subroutines.updateOffsets(subroutinesOffset);

		// Safely update all offsets at once.
		for (const [func, sub] of functions) {
			const subroutine = this.subroutines.getBySubroutine(sub);
			if (!subroutine) {
				// This should be impossible.
				throw new ExceptionInternal(
					'Invalid internal state'
				);
			}
			func.offset = subroutine.offset;
		}
		for (const [method, sub] of methods) {
			const subroutine = this.subroutines.getBySubroutine(sub);
			if (!subroutine) {
				// This should be impossible.
				throw new ExceptionInternal(
					'Invalid internal state'
				);
			}
			method.offset = subroutine.offset;
		}
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		// Read header.
		this.header = new Header();
		view.readReadable(this.header);

		// Assemble all the offsets we expect to find a subroutine.
		// Will probably contain duplicates, but those are handled in reader.
		const subOffsets: PrimitiveInt32U[] = [];
		for (const func of this.header.functionTable.entries) {
			subOffsets.push(func.offset);
		}
		for (const {structure} of this.header.classTable.entries) {
			for (const method of structure.classMethodTable.entries) {
				subOffsets.push(method.offset);
			}
		}

		// Read subroutines.
		this.subroutines = new SubroutineTable();
		this.subroutines.updateOffsets(new PrimitiveInt32U(view.offset));
		this.subroutines.readExpectedOffsets = subOffsets;
		view.readReadable(this.subroutines);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.header);
		view.writeWritable(this.subroutines);
	}

	/**
	 * Transform jump instructions to abstract ones.
	 */
	public transformAbstractJumpAdd() {
		const targetsNeeded: Set<number> = new Set();
		const targets: Map<
			number,
			InstructionAbstractJumpTarget
		> = new Map();
		const offsets = new Set([this.subroutines.baseOffset.value]);
		const targeters: Map<
			InstructionBCLPushConstanti32,
			{
				instructions: Instruction[];
				index: number;
			}
		> = new Map();
		const claimedIds: Set<number> = new Set();
		let targetId = 0;

		// Get first new ID not already in use.
		const newTargetId = () => {
			while (claimedIds.has(targetId)) {
				targetId++;
			}
			return targetId++;
		};

		// Find the existing targets, and add find where new ones are needed.
		for (const {offset, subroutine} of this.subroutines.itter()) {
			const instructions = subroutine.instructions;
			let offsetI = offset.value;
			for (let i = 0; i < instructions.length; i++) {
				const instruction = instructions[i];
				offsetI += instruction.size;
				offsets.add(offsetI);

				// Find jump relative instructions.
				const jumpTarget =
					typed.cast(instruction, InstructionAbstractJumpTarget);
				if (jumpTarget) {
					targets.set(offsetI, jumpTarget);
					targetsNeeded.delete(offsetI);
					claimedIds.add(jumpTarget.arg0.value);
					continue;
				}

				// Find jump relative instructions.
				const jumpRelative =
					typed.cast(instruction, InstructionBCLJumpRelative);
				if (!jumpRelative) {
					continue;
				}

				// Find previous BCL that pushed offset, or null.
				const jumpOffsetBCL = findJumpOffsetBCL(instructions, i);
				if (!jumpOffsetBCL) {
					continue;
				}

				// Remember target to add label, and remember instruction.
				const target = jumpOffsetBCL.arg0.value;
				if (!targets.has(target)) {
					targetsNeeded.add(target);
				}
				targeters.set(jumpOffsetBCL, {
					instructions,
					index: -1
				});
			}
		}

		// If none are needed, return now.
		if (!targeters.size) {
			return;
		}

		// Adjust any label offsets that start inside instructions.
		// Compensates for any potentailly invalid code.
		const targetsAdjusted: Map<number, number> = new Map();
		for (const target of targetsNeeded) {
			// If an instructions starts at this offset, no need to adjust it.
			if (offsets.has(target)) {
				continue;
			}

			// Remove, seek back to instruction start, and add if needed.
			targetsNeeded.delete(target);
			let newTarget = target;
			while (!offsets.has(--newTarget)) {
				if (newTarget < 0) {
					throw new ExceptionInternal('Seeked back into negatives');
				}
			}
			if (!targets.has(newTarget)) {
				targetsNeeded.add(newTarget);
				targetsAdjusted.set(target, newTarget);
			}
		}
		offsets.clear();

		// Insert targets where needed.
		for (const {offset, subroutine} of this.subroutines.itter()) {
			let offsetI = offset.value;
			for (let i = 0; i < subroutine.instructions.length; i++) {
				if (targetsNeeded.has(offsetI)) {
					targetsNeeded.delete(offsetI);

					// Insert the target at this index.
					const jt = new InstructionAbstractJumpTarget();
					jt.arg0 = new PrimitiveInt32U(newTargetId());
					subroutine.instructions.splice(i, 0, jt);
					targets.set(offsetI, jt);
					i++;
				}

				const instruction = subroutine.instructions[i];
				offsetI += instruction.size;

				// If a jump offset BCL then remember where it is.
				const offsets = targeters.get(instruction as any);
				if (offsets) {
					offsets.index = i;
				}
			}
		}
		if (targetsNeeded.size) {
			throw new ExceptionInternal('Did not process all needed targets');
		}

		// Replace targeter instructions with abstract targeters.
		for (const [targeter, info] of targeters) {
			const jumpTo = targeter.arg0.value;

			// Calculate adjustment if needed.
			// Compensates for any potentailly invalid code.
			const adjusted = targetsAdjusted.get(jumpTo);
			let adjust = 0;
			let target = targets.get(jumpTo);
			if (adjusted !== undefined) {
				adjust = jumpTo - adjusted;
				target = targets.get(adjusted);
			}
			if (!target) {
				throw new ExceptionInternal(
					`Missing target at: 0x${utilNumberToHex(jumpTo)}`
				);
			}

			if (info.index < 0) {
				throw new ExceptionInternal(
					`Negative index: ${info.index}`
				);
			}

			const inst = new InstructionAbstractPushConstanti32JumpTarget();
			inst.arg0 = target.arg0;
			inst.arg1 = new PrimitiveInt32S(adjust);
			info.instructions[info.index] = inst;
		}
	}

	/**
	 * Transform abstract jump instructions into bytecode.
	 */
	public transformAbstractJumpRemove() {
		const targeters: {
			instruction: InstructionAbstractPushConstanti32JumpTarget;
			instructions: Instruction[];
			index: number;
			amount: PrimitiveInt32S;
		}[] = [];
		const targets: Map<number, number> = new Map();
		const targetsRemove: {
			instructions: Instruction[];
			index: number;
		}[] = [];

		// Find the existing targets and targeters.
		for (const {offset, subroutine} of this.subroutines.itter()) {
			const instructions = subroutine.instructions;
			let offsetI = offset.value;
			for (let i = 0; i < instructions.length; i++) {
				const instruction = instructions[i];
				offsetI += instruction.size;

				const abs = typed.cast(instruction, InstructionAbstract);
				if (!abs) {
					continue;
				}

				const jumpTargeter = typed.cast(
					abs,
					InstructionAbstractPushConstanti32JumpTarget
				);
				if (jumpTargeter) {
					targeters.push({
						instruction: jumpTargeter,
						instructions,
						index: i,
						amount: new PrimitiveInt32S()
					});
					continue;
				}

				const jumpTarget = typed.cast(
					abs,
					InstructionAbstractJumpTarget
				);
				if (!jumpTarget) {
					continue;
				}
				targets.set(jumpTarget.arg0.value, offsetI);
				targetsRemove.push({
					instructions,
					index: i
				});
			}
		}

		// Calculate all the jumps before making any changes.
		// If any are broken, throws error before changing.
		for (const targeter of targeters) {
			const instruction = targeter.instruction;
			const jump = instruction.arg0.value;
			const jumpTo = targets.get(instruction.arg0.value);
			if (jumpTo === undefined) {
				throw new ExceptionInvalid(`Invalid jump ID: ${jump}`);
			}
			const amout = jumpTo + instruction.arg1.value;
			targeter.amount = new PrimitiveInt32S(amout);
		}

		// Replace the abstract instructions.
		for (const targeter of targeters) {
			const index = targeter.index;
			const amount = targeter.amount;

			const bc = new InstructionBCLPushConstanti32();
			bc.arg0 = amount;
			targeter.instructions[index] = bc;
		}

		// Remove the jump targets by index.
		for (let i = targetsRemove.length; i--;) {
			const info = targetsRemove[i];
			info.instructions.splice(info.index, 1);
		}
	}

	/**
	 * Transform branch instructions to abstract ones.
	 * Calls the method on every subroutine.
	 */
	public transformAbstractBranchAdd() {
		for (const {subroutine} of this.subroutines.itter()) {
			subroutine.transformAbstractBranchAdd();
		}
	}

	/**
	 * Transform abstract branch instructions into bytecode.
	 * Calls the method on every subroutine.
	 */
	public transformAbstractBranchRemove() {
		for (const {subroutine} of this.subroutines.itter()) {
			subroutine.transformAbstractBranchRemove();
		}
	}

	/**
	 * Transform bytecode string references to abstract.
	 */
	public transformAbstractStringAdd() {
		this._transformAbstractStringTableAdd(
			this.header.stringTable,
			InstructionStrings
		);
	}

	/**
	 * Transform abstract string references to bytecode.
	 * Remember to update offsets after this.
	 */
	public transformAbstractStringRemove() {
		this._transformAbstractStringTableRemove(
			this.header.stringTable,
			InstructionStrings
		);
	}

	/**
	 * Transform bytecode symbol references to abstract.
	 */
	public transformAbstractSymbolAdd() {
		this._transformAbstractStringTableAdd(
			this.header.symbolTable,
			InstructionSymbols
		);
	}

	/**
	 * Transform abstract symbol references to bytecode.
	 * Remember to update offsets after this.
	 */
	public transformAbstractSymbolRemove() {
		this._transformAbstractStringTableRemove(
			this.header.symbolTable,
			InstructionSymbols
		);
	}

	/**
	 * Transform bytecode symbol references to abstract.
	 */
	public transformAbstractGlobalAdd() {
		this._transformAbstractStringTableAdd(
			this.header.globalTable,
			InstructionGlobals,
			index => {
				// tslint:disable-next-line: no-bitwise
				if (!(index.value & 0x8000)) {
					return null;
				}
				// tslint:disable-next-line: no-bitwise
				return new PrimitiveInt16U(index.value ^ 0x8000);
			}
		);
	}

	/**
	 * Transform abstract symbol references to bytecode.
	 * Remember to update offsets after this.
	 */
	public transformAbstractGlobalRemove() {
		this._transformAbstractStringTableRemove(
			this.header.globalTable,
			InstructionGlobals,
			// tslint:disable-next-line: no-bitwise
			index => new PrimitiveInt16U(index.value | 0x8000)
		);
	}

	/**
	 * Transform bytecode class references to abstract.
	 */
	public transformAbstractClassAdd() {
		const entries = this.header.classTable.entries;
		for (const {subroutine} of this.subroutines.itter()) {
			const instructions = subroutine.instructions;
			for (let i = 0; i < instructions.length; i++) {
				const instruction = instructions[i];

				const cast = typed.cast(
					instruction, InstructionBCLCreateObject
				);
				if (!cast) {
					continue;
				}

				const index = cast.arg0.value;
				const classInfo = entries[index];
				if (!classInfo) {
					continue;
				}

				const inst = new InstructionAbstractCreateObjectString();
				inst.arg0 = classInfo.name;

				instructions[i] = inst;
			}
		}
	}

	/**
	 * Transform abstract class references to bytecode.
	 */
	public transformAbstractClassRemove() {
		const classes: Map<string, number> = new Map();
		const entries = this.header.classTable.entries;
		for (let i = 0; i < entries.length; i++) {
			const classInfo = entries[i];
			const name = classInfo.name.value;
			if (classes.has(name)) {
				throw new ExceptionInvalid(`Duplicate class name: ${name}`);
			}
			classes.set(name, i);
		}

		for (const {subroutine} of this.subroutines.itter()) {
			const instructions = subroutine.instructions;
			for (let i = 0; i < instructions.length; i++) {
				const instruction = instructions[i];

				const cast = typed.cast(
					instruction, InstructionAbstractCreateObjectString
				);
				if (!cast) {
					continue;
				}

				const name = cast.arg0.value;
				const index = classes.get(name);
				if (index === undefined) {
					throw new ExceptionInvalid(`Unknown class name: ${name}`);
				}

				const inst = new InstructionBCLCreateObject();
				inst.arg0 = new PrimitiveInt16U(index);

				instructions[i] = inst;
			}
		}
	}

	/**
	 * Generic transform for inline string table instrucitons add.
	 *
	 * @param table Table instance.
	 * @param transforms Transforms list.
	 */
	protected _transformAbstractStringTableAdd(
		table: StringP8NTable,
		transforms: ITransformString[],
		convertIndex: (
			(index: PrimitiveInt16U) => PrimitiveInt16U | null
		) | null = null
	) {
		const tableEntries = table.entries;
		for (const {subroutine} of this.subroutines.itter()) {
			const instructions = subroutine.instructions;
			for (let i = 0; i < instructions.length; i++) {
				const instruction = instructions[i];

				OUTER: for (const {BCL, ABS, args} of transforms) {
					const cast = typed.cast(instruction, BCL);
					if (!cast) {
						continue;
					}

					const inst = new ABS();

					for (let j = 0; j < cast.argc; j++) {
						const a = cast.argGet(j);
						if (!args.has(j)) {
							inst.argSet(j, a);
							continue;
						}

						let index = typed.tryCast(a, PrimitiveInt16U);
						if (convertIndex) {
							const convert = convertIndex(index);
							if (!convert) {
								break OUTER;
							}
							index = convert;
						}
						const str = tableEntries[index.value];
						if (!str) {
							break OUTER;
						}

						inst.argSet(j, str);
					}

					instructions[i] = inst;
					break;
				}
			}
		}
	}

	/**
	 * Generic transform for inline string table instrucitons remove.
	 *
	 * @param table Table instance.
	 * @param transforms Transforms list.
	 */
	protected _transformAbstractStringTableRemove(
		table: StringP8NTable,
		transforms: ITransformString[],
		convertIndex: (
			(index: PrimitiveInt16U) => PrimitiveInt16U | null
		) | null = null
	) {
		const tableEntries = table.entries;
		const stringToIndex: Map<string, number> = new Map();
		// Loop backwards to favor first instance.
		for (let i = tableEntries.length; i--;) {
			stringToIndex.set(tableEntries[i].value, i);
		}

		const addEntry = (str: PrimitiveStringP8N) => {
			const i = tableEntries.length;
			stringToIndex.set(str.value, i);
			tableEntries.push(str);
			return i;
		};

		for (const {subroutine} of this.subroutines.itter()) {
			const instructions = subroutine.instructions;
			for (let i = 0; i < instructions.length; i++) {
				const instruction = instructions[i];

				OUTER: for (const {BCL, ABS, args} of transforms) {
					const cast = typed.cast(instruction, ABS);
					if (!cast) {
						continue;
					}

					const inst = new BCL();

					for (let j = 0; j < cast.argc; j++) {
						const a = cast.argGet(j);
						if (!args.has(j)) {
							inst.argSet(j, a);
							continue;
						}

						const str = typed.tryCast(a, PrimitiveStringP8N);
						let indexNumber = stringToIndex.get(str.value);
						if (indexNumber === undefined) {
							indexNumber = addEntry(str);
						}
						let index = new PrimitiveInt16U(indexNumber);
						if (convertIndex) {
							const convert = convertIndex(index);
							if (!convert) {
								break OUTER;
							}
							index = convert;
						}

						inst.argSet(j, index);
					}

					instructions[i] = inst;
					break;
				}
			}
		}
	}
}
