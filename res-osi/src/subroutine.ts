import {
	Structure,
	BufferView,
	PrimitiveInt16S,
	PrimitiveInt32U,
	utilNumberToHex
} from '@sage-js/core';
import {typed} from './typed';
import {ExceptionInternal} from './exception/internal';
import {ExceptionInstruction} from './exception/instruction';
import {ExceptionInvalid} from './exception/invalid';
import {Instruction} from './instruction/class';
import {instructionBCLByOpcode} from './instruction/bclmap';
import {InstructionBCL} from './instruction/bcl/class';
import {
	InstructionBCLReturn
} from './instruction/bcl/return';
import {
	InstructionBCLBranchAlways
} from './instruction/bcl/branchalways';
import {
	InstructionBCLCompareAndBranchIfFalse
} from './instruction/bcl/compareandbranchiffalse';
import {
	InstructionAbstract
} from './instruction/abstract/class';
import {
	InstructionAbstractBranchTarget
} from './instruction/abstract/branchtarget';
import {
	InstructionAbstractBranchAlwaysBranchTarget
} from './instruction/abstract/branchalwaysbranchtarget';
import {
	InstructionAbstractCompareAndBranchIfFalseBranchTarget
} from './instruction/abstract/compareandbranchiffalsebranchtarget';

type InstructionAbstractBranchers =
	InstructionAbstractBranchAlwaysBranchTarget |
	InstructionAbstractCompareAndBranchIfFalseBranchTarget;

type InstructionBCLBranchers =
	InstructionBCLBranchAlways |
	InstructionBCLCompareAndBranchIfFalse;

/**
 * Convert a brancher to abstract instruction.
 *
 * @param brancher Brancher instruction.
 * @param target Branch target.
 * @param adjust Adjusment amount.
 * @return Abstract instruction.
 */
function brancherToAbstract(
	brancher: InstructionBCLBranchers,
	target: InstructionAbstractBranchTarget,
	adjust: number
) {
	const branchAlways =
		typed.cast(brancher, InstructionBCLBranchAlways);
	if (branchAlways) {
		const r = new InstructionAbstractBranchAlwaysBranchTarget();
		r.arg0 = target.arg0;
		r.arg1 = new PrimitiveInt16S(adjust);
		return r;
	}

	const branchCompare =
		typed.cast(brancher, InstructionBCLCompareAndBranchIfFalse);
	if (branchCompare) {
		const r = new InstructionAbstractCompareAndBranchIfFalseBranchTarget();
		r.arg0 = target.arg0;
		r.arg1 = new PrimitiveInt16S(adjust);
		return r;
	}

	throw new ExceptionInternal(
		`Unexpected brancher: ${brancher.name}`
	);
}

/**
 * Subroutine constructor.
 */
export class Subroutine extends Structure {

	/**
	 * Subroutine instructions.
	 */
	public instructions: Instruction[] = [];

	/**
	 * Resource constructor.
	 */
	constructor() {
		super();
	}

	/**
	 * Size of the subroutine.
	 */
	public get size() {
		let r = 0;
		for (const instruction of this.instructions) {
			r += instruction.size;
		}
		return r;
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.instructions = this.instructions.map(entry => entry.copy());
		return r;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this.instructions = [];

		let branchMax = 0;
		for (let reading = true; reading;) {
			const opcode = view.getInt8U();
			const InstructionBCL = instructionBCLByOpcode(opcode);
			if (!InstructionBCL) {
				throw new ExceptionInvalid(
					`Unused opcode: 0x${utilNumberToHex(opcode)}`
				);
			}
			const bc = new InstructionBCL();
			view.readReadable(bc);
			this.instructions.push(bc);

			const brancher =
				typed.cast(bc, InstructionBCLBranchAlways) ||
				typed.cast(bc, InstructionBCLCompareAndBranchIfFalse);
			if (brancher) {
				// Keep track of branchs.
				const offset = view.offset;
				const branch = brancher.arg0.value;
				const branchTo = offset + branch;

				// Check if branch points back out of range.
				if (branch < 0) {
					if (branchTo < 0) {
						const info = `${offset} + ${branch} = ${branchTo}`;
						throw new ExceptionInstruction(
							`Branch jumps back past the start: ${info}`
						);
					}
				}
				// Remember the furthest branch.
				else if (branchTo > branchMax) {
					branchMax = branchTo;
				}
				continue;
			}

			// If no branch points past here, last return.
			const ret = typed.cast(bc, InstructionBCLReturn);
			if (ret && view.offset > branchMax) {
				// No more returns expected, should be the end.
				reading = false;
			}
		}
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		for (const instruction of this.instructions) {
			view.writeWritable(instruction);
		}
	}

	/**
	 * Transform branch instructions to abstract ones.
	 */
	public transformAbstractBranchAdd() {
		const replaced: Map<Instruction, Instruction> = new Map();
		const added: Set<Instruction> = new Set();

		const targetsNeeded: Set<number> = new Set();
		const targets: Map<
			number,
			InstructionAbstractBranchTarget
		> = new Map();
		const offsets = new Set([0]);
		const branchers: Map<
			InstructionBCLBranchers,
			{
				index: number;
				offset: number;
			}
		> = new Map();
		let branchMOffset = -1;
		let branchMBranch = -1;
		const claimedIds: Set<number> = new Set();
		let targetId = 0;
		let needsUpdate = false;

		// Get first new ID not already in use.
		const newTargetId = () => {
			while (claimedIds.has(targetId)) {
				targetId++;
			}
			return targetId++;
		};

		// Find everywhere that we want to branch to.
		let offset = 0;
		for (const instruction of this.instructions) {
			// const off = offset;
			offset += instruction.size;
			offsets.add(offset);

			const abstract = typed.cast(instruction, InstructionAbstract);
			if (abstract) {
				const branchTarget = typed.cast(
					instruction,
					InstructionAbstractBranchTarget
				);
				if (branchTarget) {
					// Remember this address has a target, does not need adding.
					targetsNeeded.delete(offset);
					targets.set(offset, branchTarget);
					claimedIds.add(branchTarget.arg0.value);
				}
				continue;
			}

			// Get instruction as bytecode or skip.
			const bcl = typed.cast(instruction, InstructionBCL);
			if (!bcl) {
				continue;
			}

			// Get instruction as brancher or skip.
			const brancher =
				typed.cast(bcl, InstructionBCLBranchAlways) ||
				typed.cast(bcl, InstructionBCLCompareAndBranchIfFalse);
			if (!brancher) {
				continue;
			}

			needsUpdate = true;

			// Calculate the branch target.
			const branch = brancher.arg0.value;
			const branchTo = offset + branch;

			// If jumping back before the beginning, throw error.
			if (branchTo < 0) {
				const info = `${offset} + ${branch} = ${branchTo}`;
				throw new ExceptionInstruction(
					`Branch jumps back past the start: ${info}`
				);
			}

			// Remember the furthest branch.
			if (branchTo > branchMOffset + branchMBranch) {
				branchMOffset = offset;
				branchMBranch = branch;
			}

			// If this target is not known to exist, remember to add it.
			if (!targets.has(branchTo)) {
				targetsNeeded.add(branchTo);
			}
		}

		// If none are needed, return now.
		if (!needsUpdate) {
			return {
				replaced,
				added
			};
		}

		// If the max branch jumps past end, throw error.
		// Subtract 1, jumping to end would run out of bounds.
		if (
			branchMOffset > -1 &&
			(branchMOffset - branchMBranch) > offset - 1
		) {
			const branchTo = branchMOffset + branchMBranch;
			const info = `${branchMOffset} + ${branchMBranch} = ${branchTo}`;
			throw new ExceptionInstruction(
				`Branch jumps forward past the end: ${info}`
			);
		}

		// Adjust any label offsets that start inside instructions.
		// Compensates for invalid code produced by original compiler.
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
		offset = 0;
		for (let i = 0; i < this.instructions.length; i++) {
			if (targetsNeeded.has(offset)) {
				targetsNeeded.delete(offset);

				// Insert the target at this index.
				const bt = new InstructionAbstractBranchTarget();
				bt.arg0 = new PrimitiveInt32U(newTargetId());
				added.add(bt);
				this.instructions.splice(i, 0, bt);
				targets.set(offset, bt);
				i++;
			}

			const instruction = this.instructions[i];
			offset += instruction.size;

			// Get instruction as bytecode or skip.
			const bcl = typed.cast(instruction, InstructionBCL);
			if (!bcl) {
				continue;
			}

			// Get instruction as brancher or skip.
			const brancher =
				typed.cast(bcl, InstructionBCLBranchAlways) ||
				typed.cast(bcl, InstructionBCLCompareAndBranchIfFalse);
			if (!brancher) {
				continue;
			}

			// Remember branchers to update.
			branchers.set(brancher, {
				index: i,
				offset
			});
		}
		if (targetsNeeded.size) {
			throw new ExceptionInternal('Did not process all needed targets');
		}

		// Replace branch instructions with abstract branchers.
		for (const [brancher, info] of branchers) {
			// Calculate the branch target.
			const branch = brancher.arg0.value;
			const branchTo = info.offset + branch;

			// Calculate adjustment if needed.
			// Compensates for invalid code produced by original compiler.
			const adjusted = targetsAdjusted.get(branchTo);
			let adjust = 0;
			let target = targets.get(branchTo);
			if (adjusted !== undefined) {
				adjust = branchTo - adjusted;
				target = targets.get(adjusted);
			}
			if (!target) {
				throw new ExceptionInternal(
					`Missing target at: 0x${utilNumberToHex(branchTo)}`
				);
			}

			const inst = brancherToAbstract(brancher, target, adjust);
			replaced.set(this.instructions[info.index], inst);
			this.instructions[info.index] = inst;
		}

		return {
			replaced,
			added
		};
	}

	/**
	 * Transform abstract branch instructions into bytecode.
	 */
	public transformAbstractBranchRemove() {
		const replaced: Map<Instruction, Instruction> = new Map();
		const removed: Set<Instruction> = new Set();

		const branchers: {
			instruction: InstructionAbstractBranchers;
			offset: number;
			index: number;
			amount: PrimitiveInt16S;
		}[] = [];
		const targets: Map<number, number> = new Map();
		const targetsRemove: number[] = [];

		// Find the existing targets and branchers.
		let offset = 0;
		for (let i = 0; i < this.instructions.length; i++) {
			const instruction = this.instructions[i];
			offset += instruction.size;

			// Get instruction as bytecode or skip.
			const ab = typed.cast(instruction, InstructionAbstract);
			if (!ab) {
				continue;
			}

			const brancher = typed.cast(
				ab,
				InstructionAbstractBranchAlwaysBranchTarget
			) || typed.cast(
				ab,
				InstructionAbstractCompareAndBranchIfFalseBranchTarget
			);
			if (brancher) {
				branchers.push({
					instruction: brancher,
					offset,
					index: i,
					amount: new PrimitiveInt16S()
				});
				continue;
			}

			const target = typed.cast(
				ab,
				InstructionAbstractBranchTarget
			);
			// tslint:disable-next-line: early-exit
			if (target) {
				targets.set(target.arg0.value, offset);
				targetsRemove.push(i);
				continue;
			}
		}

		// Calculate all the jumps before making any changes.
		// If any are broken, throws error before changing.
		for (const brancher of branchers) {
			const instruction = brancher.instruction;
			const branch = instruction.arg0.value;
			const branchTo = targets.get(branch);
			if (branchTo === undefined) {
				throw new ExceptionInvalid(`Invalid branch ID: ${branch}`);
			}
			const offset = brancher.offset;
			const amount = (branchTo - offset) + instruction.arg1.value;
			brancher.amount = new PrimitiveInt16S(amount);
		}

		// Replace the abstract instructions.
		for (const brancher of branchers) {
			const instruction = brancher.instruction;
			const index = brancher.index;
			const amount = brancher.amount;

			const branchAlways = typed.cast(
				instruction,
				InstructionAbstractBranchAlwaysBranchTarget
			);
			if (branchAlways) {
				const bc =
					new InstructionBCLBranchAlways();
				bc.arg0 = amount;
				this.instructions[index] = bc;
				continue;
			}

			const branchCompare = typed.cast(
				instruction,
				InstructionAbstractCompareAndBranchIfFalseBranchTarget
			);
			if (branchCompare) {
				const bc =
					new InstructionBCLCompareAndBranchIfFalse();
				bc.arg0 = amount;
				replaced.set(this.instructions[index], bc);
				this.instructions[index] = bc;
				continue;
			}

			throw new ExceptionInternal(
				`Unexpected brancher: ${instruction.name}`
			);
		}

		// Remove the branch targets by index.
		for (let i = targetsRemove.length; i--;) {
			const index = targetsRemove[i];
			removed.add(this.instructions[index]);
			this.instructions.splice(index, 1);
		}

		return {
			replaced,
			removed
		};
	}
}
