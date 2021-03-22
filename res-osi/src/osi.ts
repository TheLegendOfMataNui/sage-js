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
import {
	ITransformString,
	IClassDefinitionTableEntry,
	MapClassDefinitionTableEntryExtends,
	MapClassDefinitionTableEntryExtendsOptions,
	MapClassDefinitionExtends
} from './types';
import {typed} from './typed';
import {utilMapClassDefinitionEntriesToExtends} from './util';
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
//
// Branching and jumping instructions.
import {InstructionBCLJumpRelative} from './instruction/bcl/jumprelative';
import {InstructionBCLPushConstanti32} from './instruction/bcl/pushconstanti32';
import {InstructionAbstractJumpTarget} from './instruction/abstract/jumptarget';
import {
	InstructionAbstractPushConstanti32JumpTarget
} from './instruction/abstract/pushconstanti32jumptarget';
//
// PushConstantString
import {
	InstructionBCLPushConstantString
} from './instruction/bcl/pushconstantstring';
import {
	InstructionAbstractPushConstantStringString
} from './instruction/abstract/pushconstantstringstring';
//
// GetGameVariable
import {
	InstructionBCLGetGameVariable
} from './instruction/bcl/getgamevariable';
import {
	InstructionAbstractGetGameVariableString
} from './instruction/abstract/getgamevariablestring';
//
// SetGameVariable
import {
	InstructionBCLSetGameVariable
} from './instruction/bcl/setgamevariable';
import {
	InstructionAbstractSetGameVariableString
} from './instruction/abstract/setgamevariablestring';
//
// CallGameFunction
import {
	InstructionBCLCallGameFunction
} from './instruction/bcl/callgamefunction';
import {
	InstructionAbstractCallGameFunctionString
} from './instruction/abstract/callgamefunctionstring';
//
// CallGameFunctionFromString
import {
	InstructionBCLCallGameFunctionFromString
} from './instruction/bcl/callgamefunctionfromstring';
import {
	InstructionAbstractCallGameFunctionFromStringString
} from './instruction/abstract/callgamefunctionfromstringstring';
//
// GetThisMemberFunction
import {
	InstructionBCLGetThisMemberFunction
} from './instruction/bcl/getthismemberfunction';
import {
	InstructionAbstractGetThisMemberFunctionString
} from './instruction/abstract/getthismemberfunctionstring';
//
// GetThisMemberValue
import {
	InstructionBCLGetThisMemberValue
} from './instruction/bcl/getthismembervalue';
import {
	InstructionAbstractGetThisMemberValueString
} from './instruction/abstract/getthismembervaluestring';
//
// SetThisMemberValue
import {
	InstructionBCLSetThisMemberValue
} from './instruction/bcl/setthismembervalue';
import {
	InstructionAbstractSetThisMemberValueString
} from './instruction/abstract/setthismembervaluestring';
//
// GetMemberFunction
import {
	InstructionBCLGetMemberFunction
} from './instruction/bcl/getmemberfunction';
import {
	InstructionAbstractGetMemberFunctionString
} from './instruction/abstract/getmemberfunctionstring';
//
// GetMemberValue
import {
	InstructionBCLGetMemberValue
} from './instruction/bcl/getmembervalue';
import {
	InstructionAbstractGetMemberValueString
} from './instruction/abstract/getmembervaluestring';
//
// SetMemberValue
import {
	InstructionBCLSetMemberValue
} from './instruction/bcl/setmembervalue';
import {
	InstructionAbstractSetMemberValueString
} from './instruction/abstract/setmembervaluestring';
//
// GetVariableValue
import {
	InstructionBCLGetVariableValue
} from './instruction/bcl/getvariablevalue';
import {
	InstructionAbstractGetVariableValueGlobalString
} from './instruction/abstract/getvariablevalueglobalstring';
//
// SetVariableValue
import {
	InstructionBCLSetVariableValue
} from './instruction/bcl/setvariablevalue';
import {
	InstructionAbstractSetVariableValueGlobalString
} from './instruction/abstract/setvariablevalueglobalstring';
//
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
		args: new Set([0, 1])
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
 * @returns Instruction, null, or throw.
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
	 * @returns Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.header = this.header.copy();
		r.subroutines = this.subroutines.copy();
		return r;
	}

	/**
	 * Byte size.
	 *
	 * @returns Byte size.
	 */
	public get size() {
		return this.header.size + this.subroutines.size;
	}

	/**
	 * Update the offsets in the subroutines, and their mappings in the header.
	 * If any subroutines are empty, this will throw without changes.
	 * This does not update jump relatives, which should be abstracted.
	 */
	public updateOffsets() {
		// Assemble mappings from functions and methods to subroutines.
		const functions =
			new Map<FunctionDefinition, Subroutine>();
		const methods =
			new Map<ClassDefinitionMethod, Subroutine>();

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
				throw new ExceptionInternal('Invalid internal state');
			}
			func.offset = subroutine.offset;
		}
		for (const [method, sub] of methods) {
			const subroutine = this.subroutines.getBySubroutine(sub);
			if (!subroutine) {
				// This should be impossible.
				throw new ExceptionInternal('Invalid internal state');
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
	 * Attempts to map classes to possible ancestor classes.
	 * Uses the properties and methods to find the possible matches.
	 * A child class has the same properties and methods as a parent class.
	 * Some false positives are fairly likely.
	 *
	 * @returns Mapped classes to some possible ancestors.
	 */
	public mapClassPossibleAncestors() {
		const classList = this.header.classTable.entries;

		const r = new Map() as (
			Map<IClassDefinitionTableEntry, IClassDefinitionTableEntry[]>
		);

		for (const cInfo of classList) {
			const cStruct = cInfo.structure;

			const cProperties = new Set(
				[...cStruct.itterProperties()].map(p => p.symbol.value)
			);
			const cMethods = new Set(
				[...cStruct.itterMethods()].map(p => p.symbol.value)
			);
			const candidates: IClassDefinitionTableEntry[] = [];

			// Search for parent candidates.
			LOOP_PARENTS: for (const pInfo of classList) {
				if (cInfo === pInfo) {
					continue;
				}

				const pStruct = pInfo.structure;

				// Reject if property not in child.
				for (const property of pStruct.itterProperties()) {
					if (!cProperties.has(property.symbol.value)) {
						continue LOOP_PARENTS;
					}
				}

				// Reject if method not in child.
				for (const method of pStruct.itterMethods()) {
					if (!cMethods.has(method.symbol.value)) {
						continue LOOP_PARENTS;
					}
				}

				// Add to candidates list.
				candidates.push(pInfo);
			}

			// Map class to the candidates list.
			r.set(cInfo, candidates);
		}

		return r;
	}

	/**
	 * Attempts to map classes to possible parent classes.
	 * See mapClassPossibleAncestors for the first pass.
	 * Filters to only the direct parent be checking how many new constructors.
	 * A direct child class should only add one new constructor.
	 * Some false positives are possible but highly unlikely.
	 *
	 * @returns Mapped classes to some possible parents.
	 */
	public mapClassPossibleParents() {
		const classList = this.header.classTable.entries;
		const symbolList = this.header.symbolTable.entries;

		const r = new Map() as MapClassDefinitionTableEntryExtendsOptions;

		// Find constructor offsets, once a constructor always one.
		const hasConstructors = new Set<IClassDefinitionTableEntry>();
		const constructors = new Set<number>();
		for (const cInfo of classList) {
			const cStruct = cInfo.structure;
			for (const method of cStruct.itterMethods()) {
				const symbol = symbolList[method.symbol.value];
				if (!symbol) {
					continue;
				}
				if (cInfo.name.value !== symbol.value) {
					continue;
				}
				hasConstructors.add(cInfo);
				constructors.add(method.offset.value);
			}
		}

		// Loop over possible ancestors.
		const mapPossibleAncestors = this.mapClassPossibleAncestors();
		for (const [cInfo, aInfos] of mapPossibleAncestors) {
			const cStruct = cInfo.structure;
			const hasConstructor = hasConstructors.has(cInfo);

			// Search for parent candidates.
			const candidates: IClassDefinitionTableEntry[] = [];
			LOOP_ANCESTORS: for (const aInfo of aInfos) {
				const aStruct = aInfo.structure;

				// Search methods added in the child for constructors.
				let addedConstructors = 0;
				const aMethods = new Set(
					[...aStruct.itterMethods()].map(m => m.symbol.value)
				);
				for (const method of cStruct.itterMethods()) {
					// Skip methods from ancestor.
					if (aMethods.has(method.symbol.value)) {
						continue;
					}

					// Skip the non-constructor methods.
					if (!constructors.has(method.offset.value)) {
						continue;
					}

					// Not a direct parent class if:
					// If no constructor expected but one was found.
					// If multiple constructors added.
					if (!hasConstructor || ++addedConstructors > 1) {
						continue LOOP_ANCESTORS;
					}
				}

				candidates.push(aInfo);
			}

			r.set(cInfo, candidates);
		}

		return r;
	}

	/**
	 * Attempts to map classes to parents.
	 *
	 * @returns Mapped classes to parents.
	 */
	public mapClassParents() {
		const r = new Map() as MapClassDefinitionTableEntryExtends;

		// Get the list of possible parents.
		const mapPossibleParents = this.mapClassPossibleParents();

		// In far edgecase it may be possible a class has multiple candidates.
		// In such a case, it might be possible to analyze the constructor.
		// Then based on what super constructor is called reduce candidates.
		// Not currently implemented but could be done here.

		for (const [cInfo, pInfos] of mapPossibleParents) {
			const cStruct = cInfo.structure;

			let candidates = pInfos;
			let candidatesProbability = -1;

			const candidateProbability = (
				candidate: IClassDefinitionTableEntry,
				probably: number
			) => {
				// If candidate has higher probability, reset the list and max.
				if (probably > candidatesProbability) {
					candidates = [];
					candidatesProbability = probably;
				}
				// If candidate has highest probability, add to list.
				if (probably === candidatesProbability) {
					candidates.push(candidate);
				}
			};

			// Prefer candidates with most methods using same subroutines.
			const cMethods = new Map<number, number>();
			for (const m of cStruct.itterMethods()) {
				cMethods.set(m.symbol.value, m.offset.value);
			}
			for (const pInfo of candidates.slice()) {
				let probably = 0;
				for (const m of pInfo.structure.itterMethods()) {
					const cMethod = cMethods.get(m.symbol.value);
					// eslint-disable-next-line no-undefined
					if (cMethod === undefined) {
						// This should be impossible.
						throw new ExceptionInternal('Invalid internal state');
					}
					// Check if same subroutine was inherited.
					if (cMethod !== m.offset.value) {
						probably++;
					}
				}
				candidateProbability(pInfo, probably);
			}

			// Prefer remaining candidates with most methods in common.
			candidatesProbability = -1;
			for (const pInfo of candidates.slice()) {
				candidateProbability(
					pInfo,
					[...pInfo.structure.itterMethods()].length
				);
			}

			// Prefer remaining candidates with most properties in common.
			candidatesProbability = -1;
			for (const pInfo of candidates.slice()) {
				candidateProbability(
					pInfo,
					[...pInfo.structure.itterProperties()].length
				);
			}

			// Set what should be only one remaining candidate or null.
			r.set(cInfo, candidates.length ? candidates[0] : null);
		}

		return r;
	}

	/**
	 * Transform classes to add extends properties.
	 *
	 * @param map Optional mappings, default created from mapClassParents.
	 */
	public transformClassExtendsAdd(
		map: MapClassDefinitionExtends | null = null
	) {
		map = map || utilMapClassDefinitionEntriesToExtends(
			this.mapClassParents()
		);
		this.header.transformClassExtendsAdd(map);
	}

	/**
	 * Transform classes to remove extends properties.
	 */
	public transformClassExtendsRemove() {
		this.header.transformClassExtendsRemove();
	}

	/**
	 * Transform jump instructions to abstract ones.
	 *
	 * @returns Update report.
	 */
	public transformAbstractJumpAdd() {
		const replaced = new Map<Instruction, Instruction>();
		const added = new Set<Instruction>();

		const targetsNeeded = new Set<number>();
		const targets = new Map() as Map<number, InstructionAbstractJumpTarget>;
		const offsets = new Set([this.subroutines.baseOffset.value]);
		const targeters = new Map() as Map<InstructionBCLPushConstanti32, {

			/**
			 * Instructions.
			 */
			instructions: Instruction[];

			/**
			 * Index.
			 */
			index: number;
		}>;
		const claimedIds = new Set<number>();
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
			const {instructions} = subroutine;
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
			return {
				replaced,
				added
			};
		}

		// Adjust any label offsets that start inside instructions.
		// Compensates for any potentailly invalid code.
		const targetsAdjusted = new Map<number, number>();
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
					added.add(jt);
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
			// eslint-disable-next-line no-undefined
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
			replaced.set(info.instructions[info.index], inst);
			info.instructions[info.index] = inst;
		}

		return {
			replaced,
			added
		};
	}

	/**
	 * Transform abstract jump instructions into bytecode.
	 *
	 * @returns Update report.
	 */
	public transformAbstractJumpRemove() {
		const replaced = new Map<Instruction, Instruction>();
		const removed = new Set<Instruction>();

		const targeters: {

			/**
			 * Instruction.
			 */
			instruction: InstructionAbstractPushConstanti32JumpTarget;

			/**
			 * Instructions.
			 */
			instructions: Instruction[];

			/**
			 * Index.
			 */
			index: number;

			/**
			 * Amount.
			 */
			amount: PrimitiveInt32S;
		}[] = [];
		const targets = new Map<number, number>();
		const targetsRemove: {

			/**
			 * Instructions.
			 */
			instructions: Instruction[];

			/**
			 * Index.
			 */
			index: number;
		}[] = [];

		// Find the existing targets and targeters.
		for (const {offset, subroutine} of this.subroutines.itter()) {
			const {instructions} = subroutine;
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
			const {instruction} = targeter;
			const jump = instruction.arg0.value;
			const jumpTo = targets.get(instruction.arg0.value);
			// eslint-disable-next-line no-undefined
			if (jumpTo === undefined) {
				throw new ExceptionInvalid(`Invalid jump ID: ${jump}`);
			}
			const amout = jumpTo + instruction.arg1.value;
			targeter.amount = new PrimitiveInt32S(amout);
		}

		// Replace the abstract instructions.
		for (const targeter of targeters) {
			const {index, amount} = targeter;

			const bc = new InstructionBCLPushConstanti32();
			bc.arg0 = amount;
			replaced.set(targeter.instructions[index], bc);
			targeter.instructions[index] = bc;
		}

		// Remove the jump targets by index.
		for (let i = targetsRemove.length; i--;) {
			const info = targetsRemove[i];
			removed.add(info.instructions[info.index]);
			info.instructions.splice(info.index, 1);
		}

		return {
			replaced,
			removed
		};
	}

	/**
	 * Transform branch instructions to abstract ones.
	 * Calls the method on every subroutine.
	 *
	 * @returns Update report.
	 */
	public transformAbstractBranchAdd() {
		const replaced = new Map<Instruction, Instruction>();
		const added = new Set<Instruction>();

		for (const {subroutine} of this.subroutines.itter()) {
			const info = subroutine.transformAbstractBranchAdd();
			for (const [a, b] of info.replaced) {
				replaced.set(a, b);
			}
			for (const a of info.added) {
				added.add(a);
			}
		}

		return {
			replaced,
			added
		};
	}

	/**
	 * Transform abstract branch instructions into bytecode.
	 * Calls the method on every subroutine.
	 *
	 * @returns Update report.
	 */
	public transformAbstractBranchRemove() {
		const replaced = new Map<Instruction, Instruction>();
		const removed = new Set<Instruction>();

		for (const {subroutine} of this.subroutines.itter()) {
			const info = subroutine.transformAbstractBranchRemove();
			for (const [a, b] of info.replaced) {
				replaced.set(a, b);
			}
			for (const a of info.removed) {
				removed.add(a);
			}
		}

		return {
			replaced,
			removed
		};
	}

	/**
	 * Transform bytecode string references to abstract.
	 *
	 * @returns Update report.
	 */
	public transformAbstractStringAdd() {
		return this._transformAbstractStringTableAdd(
			this.header.stringTable,
			InstructionStrings
		);
	}

	/**
	 * Transform abstract string references to bytecode.
	 * Remember to update offsets after this.
	 *
	 * @returns Update report.
	 */
	public transformAbstractStringRemove() {
		return this._transformAbstractStringTableRemove(
			this.header.stringTable,
			InstructionStrings
		);
	}

	/**
	 * Transform bytecode symbol references to abstract.
	 *
	 * @returns Update report.
	 */
	public transformAbstractSymbolAdd() {
		return this._transformAbstractStringTableAdd(
			this.header.symbolTable,
			InstructionSymbols
		);
	}

	/**
	 * Transform abstract symbol references to bytecode.
	 * Remember to update offsets after this.
	 *
	 * @returns Update report.
	 */
	public transformAbstractSymbolRemove() {
		return this._transformAbstractStringTableRemove(
			this.header.symbolTable,
			InstructionSymbols
		);
	}

	/**
	 * Transform bytecode symbol references to abstract.
	 *
	 * @returns Update report.
	 */
	public transformAbstractGlobalAdd() {
		return this._transformAbstractStringTableAdd(
			this.header.globalTable,
			InstructionGlobals,
			index => {
				// eslint-disable-next-line no-bitwise
				if (!(index.value & 0x8000)) {
					return null;
				}
				// eslint-disable-next-line no-bitwise
				return new PrimitiveInt16U(index.value ^ 0x8000);
			}
		);
	}

	/**
	 * Transform abstract symbol references to bytecode.
	 * Remember to update offsets after this.
	 *
	 * @returns Update report.
	 */
	public transformAbstractGlobalRemove() {
		return this._transformAbstractStringTableRemove(
			this.header.globalTable,
			InstructionGlobals,
			// eslint-disable-next-line no-bitwise
			index => new PrimitiveInt16U(index.value | 0x8000)
		);
	}

	/**
	 * Transform bytecode class references to abstract.
	 *
	 * @returns Update report.
	 */
	public transformAbstractClassAdd() {
		const replaced = new Map<Instruction, Instruction>();
		const skipped = new Set<Instruction>();

		// Check that there are no duplicate class names.
		const classes = new Set<string>();
		const {entries} = this.header.classTable;
		for (const classInfo of entries) {
			const name = classInfo.name.value;
			if (classes.has(name)) {
				throw new ExceptionInvalid(`Duplicate class name: ${name}`);
			}
			classes.add(name);
		}
		classes.clear();

		for (const {subroutine} of this.subroutines.itter()) {
			const {instructions} = subroutine;
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
					skipped.add(instruction);
					continue;
				}

				const inst = new InstructionAbstractCreateObjectString();
				inst.arg0 = classInfo.name;

				replaced.set(instruction, inst);
				instructions[i] = inst;
			}
		}

		return {
			replaced,
			skipped
		};
	}

	/**
	 * Transform abstract class references to bytecode.
	 *
	 * @returns Update report.
	 */
	public transformAbstractClassRemove() {
		const replaced = new Map<Instruction, Instruction>();
		const skipped = new Set<Instruction>();

		// Map class names to indexes, checking there are no duplicates.
		const classes = new Map<string, number>();
		const {entries} = this.header.classTable;
		for (let i = 0; i < entries.length; i++) {
			const classInfo = entries[i];
			const name = classInfo.name.value;
			if (classes.has(name)) {
				throw new ExceptionInvalid(`Duplicate class name: ${name}`);
			}
			classes.set(name, i);
		}

		for (const {subroutine} of this.subroutines.itter()) {
			const {instructions} = subroutine;
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
				// eslint-disable-next-line no-undefined
				if (index === undefined) {
					skipped.add(instruction);
					continue;
				}

				const inst = new InstructionBCLCreateObject();
				inst.arg0 = new PrimitiveInt16U(index);

				replaced.set(instruction, inst);
				instructions[i] = inst;
			}
		}

		return {
			replaced,
			skipped
		};
	}

	/**
	 * Generic transform for inline string table instructions add.
	 *
	 * @param table Table instance.
	 * @param transforms Transforms list.
	 * @param convertIndex Index value.
	 * @returns Update report.
	 */
	protected _transformAbstractStringTableAdd(
		table: StringP8NTable,
		transforms: ITransformString[],
		convertIndex: (
			(index: PrimitiveInt16U) => PrimitiveInt16U | null
		) | null = null
	) {
		const replaced = new Map<Instruction, Instruction>();
		const skipped = new Set<Instruction>();

		const tableEntries = table.entries;
		for (const {subroutine} of this.subroutines.itter()) {
			const {instructions} = subroutine;
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
							skipped.add(instruction);
							break OUTER;
						}

						inst.argSet(j, str);
					}

					replaced.set(instruction, inst);
					instructions[i] = inst;
					break;
				}
			}
		}

		return {
			replaced,
			skipped
		};
	}

	/**
	 * Generic transform for inline string table instructions remove.
	 *
	 * @param table Table instance.
	 * @param transforms Transforms list.
	 * @param convertIndex Index value.
	 * @returns Update report.
	 */
	protected _transformAbstractStringTableRemove(
		table: StringP8NTable,
		transforms: ITransformString[],
		convertIndex: (
			(index: PrimitiveInt16U) => PrimitiveInt16U
		) | null = null
	) {
		const replaced = new Map<Instruction, Instruction>();

		const tableEntries = table.entries;
		const stringToIndex = new Map<string, number>();

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
			const {instructions} = subroutine;
			for (let i = 0; i < instructions.length; i++) {
				const instruction = instructions[i];

				for (const {BCL, ABS, args} of transforms) {
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
						// eslint-disable-next-line no-undefined
						if (indexNumber === undefined) {
							indexNumber = addEntry(str);
						}
						let index = new PrimitiveInt16U(indexNumber);
						if (convertIndex) {
							index = convertIndex(index);
						}

						inst.argSet(j, index);
					}

					replaced.set(instruction, inst);
					instructions[i] = inst;
					break;
				}
			}
		}

		return {
			replaced
		};
	}
}
