import {
	Structure,
	BufferView,
	decoratorProperty,
	PrimitiveInt32U
} from '@sage-js/core';
import {ExceptionInternal} from './exception/internal';
import {ExceptionInvalid} from './exception/invalid';
import {ExceptionSubroutine} from './exception/subroutine';
import {
	ISubroutineTableEntry,
	SubroutineTableEntryEach
} from './types';
import {Subroutine} from './subroutine';

/**
 * SubroutineTable constructor.
 */
export class SubroutineTable extends Structure {
	/**
	 * The current base offset.
	 */
	@decoratorProperty(false)
	protected _baseOffset = new PrimitiveInt32U();

	/**
	 * Subroutine by offset.
	 */
	@decoratorProperty(false)
	protected _mapOffsetSubroutine: Map<number, Subroutine> =
		new Map();

	/**
	 * Offset by subroutine.
	 */
	@decoratorProperty(false)
	protected _mapSubroutineOffset: Map<Subroutine, number> =
		new Map();

	/**
	 * Cached last.
	 */
	@decoratorProperty(false)
	protected _cacheLast: Subroutine | null = null;

	/**
	 * Optional expected subroutine offsets for reading.
	 * Reset to null when read called.
	 */
	@decoratorProperty(false)
	public readExpectedOffsets: PrimitiveInt32U[] | null = null;

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
		r._baseOffset = this._baseOffset;
		for (const {offset, subroutine} of this.itter()) {
			r._mapOffsetSubroutine.set(offset.value, subroutine);
			r._mapSubroutineOffset.set(subroutine, offset.value);
			r._cacheLast = subroutine;
		}
		return r;
	}

	/**
	 * Byte size.
	 */
	public get size() {
		let r = 0;
		for (const [subroutine] of this._mapSubroutineOffset) {
			r += subroutine.size;
		}
		return r;
	}

	/**
	 * Get the base offset.
	 */
	public get baseOffset() {
		return this._baseOffset;
	}

	/**
	 * Clear collection.
	 */
	public clear() {
		this._mapOffsetSubroutine.clear();
		this._mapSubroutineOffset.clear();
		this._cacheLast = null;
	}

	/**
	 * Check if entry exists by offset.
	 *
	 * @param offset Subroutine offset.
	 * @return True if present, false if not.
	 */
	public hasByOffset(offset: PrimitiveInt32U) {
		return this._mapOffsetSubroutine.has(offset.value);
	}

	/**
	 * Check if entry exists by subroutine.
	 *
	 * @param subroutine Subroutine object.
	 * @return True if present, false if not.
	 */
	public hasBySubroutine(subroutine: Subroutine) {
		return this._mapSubroutineOffset.has(subroutine);
	}

	/**
	 * Get the entry at an offset.
	 *
	 * @param offset Subroutine offset.
	 * @return Entry object or null.
	 */
	public getByOffset(
		offset: PrimitiveInt32U
	): ISubroutineTableEntry | null {
		const subroutine = this._mapOffsetSubroutine.get(offset.value);
		return subroutine ? {
			offset,
			subroutine
		} : null;
	}

	/**
	 * Get the entry for a subroutine.
	 *
	 * @param subroutine Subroutine object.
	 * @return Entry object or null.
	 */
	public getBySubroutine(
		subroutine: Subroutine
	): ISubroutineTableEntry | null {
		const offset = this._mapSubroutineOffset.get(subroutine);
		return typeof offset === 'undefined' ? null : {
			offset: new PrimitiveInt32U(offset),
			subroutine
		};
	}

	/**
	 * Remove the entry at an offset.
	 *
	 * @param offset Subroutine offset.
	 */
	public removeByOffset(offset: PrimitiveInt32U) {
		// Get the other value to remove.
		const subroutine = this._mapOffsetSubroutine.get(offset.value);
		if (!subroutine) {
			return;
		}

		// Remove from mappings, and maybe remove from cache.
		this._mapOffsetSubroutine.delete(offset.value);
		this._mapSubroutineOffset.delete(subroutine);
		if (this._cacheLast === subroutine) {
			this._cacheLast = null;
		}
	}

	/**
	 * Remove the entry at an offset.
	 *
	 * @param subroutine Subroutine object.
	 */
	public removeBySubroutine(subroutine: Subroutine) {
		// Get the other value to remove.
		const offset = this._mapSubroutineOffset.get(subroutine);
		if (typeof offset === 'undefined') {
			return;
		}

		// Remove from mappings, and maybe remove from cache.
		this._mapOffsetSubroutine.delete(offset);
		this._mapSubroutineOffset.delete(subroutine);
		if (this._cacheLast === subroutine) {
			this._cacheLast = null;
		}
	}

	/**
	 * Get the last entry, using caching for speed.
	 *
	 * @return Entry object or null.
	 */
	public getLast(): ISubroutineTableEntry | null {
		// Get the cached last from cache, or find and cache.
		let cacheLast = this._cacheLast;
		if (!cacheLast || !this._mapSubroutineOffset.has(cacheLast)) {
			for (const [subroutine] of this._mapSubroutineOffset) {
				cacheLast = subroutine;
			}
			this._cacheLast = cacheLast;
		}

		// If none found, empty list, so return null.
		if (!cacheLast) {
			return null;
		}

		// Get the subroutine offset.
		const addr = this._mapSubroutineOffset.get(cacheLast);
		if (typeof addr === 'undefined') {
			// This should be impossible.
			throw new ExceptionInternal('Invalid internal state');
		}

		// Return information.
		return {
			offset: new PrimitiveInt32U(addr),
			subroutine: cacheLast
		};
	}

	/**
	 * Add an existing subroutine, after the last one if existing.
	 *
	 * @return Entry object.
	 */
	public addSubroutine(
		subroutine: Subroutine
	): ISubroutineTableEntry {
		// Check that this subroutine is not already added.
		if (this._mapSubroutineOffset.has(subroutine)) {
			throw new ExceptionInvalid(
				'Subroutine already a member'
			);
		}

		// Calculate the offset to insert after the last, if present.
		const last = this.getLast();
		let offset;
		if (last) {
			// Get and validate the size of last subroutine.
			const lastSubSize = last.subroutine.size;
			if (lastSubSize < 1) {
				throw new ExceptionInvalid(
					'The current last subroutine is empty'
				);
			}

			// Put the new subroutine after the last one.
			offset = last.offset.value + lastSubSize;
		}
		else {
			offset = this._baseOffset.value;
		}

		// Create mappings between offset and subroutine, update cache.
		this._mapOffsetSubroutine.set(offset, subroutine);
		this._mapSubroutineOffset.set(subroutine, offset);
		this._cacheLast = subroutine;

		// Return information.
		return {
			offset: new PrimitiveInt32U(offset),
			subroutine
		};
	}

	/**
	 * Add a new entry, after the last one if existing.
	 * The new subroutine will be empty, which is technically invalid.
	 * Instructions must be added before another instruction can be appended.
	 * It is also not possible to update offsets or write if any left empty.
	 *
	 * @return Entry object.
	 */
	public addNew(): ISubroutineTableEntry {
		return this.addSubroutine(new Subroutine());
	}

	/**
	 * Itterate over subroutines in offset order.
	 *
	 * @return The itterator.
	 */
	public * itter() {
		// Maps are defined to itterate in insertion order.
		// The public API always inserted at the end, so this does work.
		// Do not add an API to add anywhere else, or order will get difficult.
		for (const [addr, subroutine] of this._mapOffsetSubroutine) {
			const entry: ISubroutineTableEntry = {
				offset: new PrimitiveInt32U(addr),
				subroutine
			};
			yield entry;
		}
	}

	/**
	 * A function based itterator.
	 *
	 * @param each Callback function for each.
	 */
	public forEach(each: SubroutineTableEntryEach) {
		for (const entry of this.itter()) {
			each(entry);
		}
	}

	/**
	 * Update the offsets, using a given base offset.
	 * If any subroutines are empty, this will throw without changes.
	 * This does not update jump relatives, which should be abstracted.
	 *
	 * @param base Base offset.
	 */
	public updateOffsets(base: PrimitiveInt32U) {
		let newOffset = base.value;

		// Create the new mappings.
		const mapOffsetSubroutine = new Map();
		const mapSubroutineOffset = new Map();

		// Update all the offsets.
		for (const [
			offsetCurrent,
			subroutine
		] of this._mapOffsetSubroutine) {
			// Get size and validate.
			const subSize = subroutine.size;
			if (!subSize) {
				const offsetHex = offsetCurrent.toString(16).toUpperCase();
				throw new ExceptionInvalid(
					`Invalid empty subroutine found at offset 0x${offsetHex}`
				);
			}

			// Add to new mappings.
			mapOffsetSubroutine.set(newOffset, subroutine);
			mapSubroutineOffset.set(subroutine, newOffset);

			// Update the offset counter.
			newOffset += subSize;
		}

		// Update the base offset.
		this._baseOffset = base;

		// Clear and replace mappings.
		this._mapOffsetSubroutine.clear();
		this._mapSubroutineOffset.clear();
		this._mapOffsetSubroutine = mapOffsetSubroutine;
		this._mapSubroutineOffset = mapSubroutineOffset;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		// Get and clear the optional extra reading data.
		const readExpectedOffsets = this.readExpectedOffsets || [];
		this.readExpectedOffsets = null;

		// Filter for unique and sort the expected list, if present.
		const subOffsets = [
			...(new Set(
				readExpectedOffsets.map(v => v.value)
			))
		]
			.sort((a, b) => a - b);

		const subOffsetsNext = () => subOffsets.length ? subOffsets[0] : null;

		const baseOffset = this._baseOffset.value;

		// Clear maps.
		this._mapOffsetSubroutine.clear();
		this._mapSubroutineOffset.clear();
		this._cacheLast = null;

		// Read subroutines until the buffer ends, or bust.
		while (view.remaining) {
			const offset = baseOffset + view.offset;

			// If this was an expected subroutine, remove from the list.
			if (offset === subOffsetsNext()) {
				subOffsets.shift();
			}

			// Read the next subroutine.
			const subroutine = new Subroutine();
			view.readReadable(subroutine);

			// Calculate offset of the next subroutine.
			const offsetNext = baseOffset + view.offset;

			// Create mappings between offset and subroutine, update cache.
			this._mapOffsetSubroutine.set(offset, subroutine);
			this._mapSubroutineOffset.set(subroutine, offset);
			this._cacheLast = subroutine;

			// Check if this subroutine read past the start of the next one.
			const nextExpected = subOffsetsNext();
			// tslint:disable-next-line: early-exit
			if (nextExpected !== null && offsetNext > nextExpected) {
				const info = `${offsetNext} > ${nextExpected}`;
				throw new ExceptionSubroutine(
					`Read into another subroutine: ${info}`
				);
			}
		}

		// tslint:disable-next-line: early-exit
		if (subOffsets.length) {
			const remaining = subOffsets.length;
			throw new ExceptionSubroutine(
				`Did not find all expected subroutines, missed: ${remaining}`
			);
		}
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		for (const {subroutine} of this.itter()) {
			view.writeWritable(subroutine);
		}
	}
}
