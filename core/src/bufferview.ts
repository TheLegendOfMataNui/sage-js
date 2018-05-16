import {
	IArrayBufferView,
	ArrayBuffers,
	IBufferReadable,
	IBufferWriteable,
	IBufferReadableNew
} from './types';
import {
	MAX_SAFE_INTEGER,
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
import {ExceptionValue} from './exception/value';
import {ExceptionReadonly} from './exception/readonly';
import {assertIntegerRange} from './assert';
import {decoratorProperty} from './decorators';

const regexHex = /^[0-9A-F]{1,2}$/i;
const regexNoHex = /[^0-9A-F]/ig;
const regexUpTo2C = /.{1,2}/g;

/**
 * Create typed array of a DataView, using either the same buffer or a copy.
 *
 * @param Constructor The typed array constructor to use.
 * @param d The DataView to create array from.
 * @param copy Optionally copy the buffer.
 * @return The array.
 */
function viewAs8Array(
	Constructor: Uint8ArrayConstructor | Int8ArrayConstructor,
	d: DataView,
	copy = false
) {
	const a = new Constructor(d.buffer, d.byteOffset, d.byteLength);
	if (copy) {
		// Copy array, prefering slice if available, can be better optimized.
		// Fallback on set method, with better support, but possibly slower.
		if (a.slice) {
			return a.slice();
		}
		const r = new Constructor(a.byteLength);
		r.set(a);
		return r;
	}
	return a;
}

/**
 * Create an exception for invalid bits size.
 * @param bits The number of bits.
 * @return Exception object.
 */
function exceptionInvalidBitsSize(bits: number) {
	return new ExceptionValue(`Invalid bits size: ${bits}`);
}

/**
 * Create buffer view of an existing buffer type.
 *
 * @param data The buffer to create view of.
 * @param endianL True for little endian, false for big endian.
 * @param offset Offset in the passed data.
 * @param size Size of the data.
 */
export class BufferView extends Object {

	/**
	 * Current offset.
	 */
	@decoratorProperty(false)
	protected _offset: number = 0;

	/**
	 * Endian little.
	 */
	@decoratorProperty(false)
	protected _endianL: boolean;

	/**
	 * Flag to mark as only readable.
	 */
	@decoratorProperty(false)
	protected readonly _readonly: boolean = false;

	/**
	 * The wrapped DataView object.
	 */
	@decoratorProperty(false)
	protected readonly _dataview: DataView;

	constructor(
		data: IArrayBufferView | ArrayBuffers,
		endianL: boolean,
		offset = 0,
		size = -1,
		readonly = false
	) {
		super();

		let byteLength;
		let byteOffset;
		const bufferView = data as IArrayBufferView;

		// Check if a wrapper for ArrayBuffers, or a plain buffer.
		let buffer = bufferView.buffer;
		if (buffer) {
			// The Node style Buffer also implements these properties.
			byteLength = bufferView.byteLength;
			byteOffset = bufferView.byteOffset;
		}
		else {
			buffer = data as ArrayBuffers;
			byteLength = buffer.byteLength;
			byteOffset = 0;
		}

		size = size < 0 ? byteLength - offset : size;

		assertIntegerRange(offset, 'offset', 0, byteLength);
		assertIntegerRange(size, 'size', 0, byteLength - offset);

		this._endianL = endianL;
		this._readonly = readonly;

		this._dataview = new DataView(buffer, byteOffset + offset, size);
	}

	/**
	 * True if little endian.
	 */
	public get endianL() {
		return this._endianL;
	}

	/**
	 * Set endian by little.
	 */
	public set endianL(value) {
		this._endianL = value;
	}

	/**
	 * True if big endian.
	 */
	public get endianB() {
		return !this._endianL;
	}

	/**
	 * Set endian by big.
	 */
	public set endianB(value) {
		this._endianL = !value;
	}

	/**
	 * True if only readable.
	 */
	public get readonly() {
		return this._readonly;
	}

	/**
	 * Total bytes.
	 */
	public get size() {
		return this._dataview.byteLength;
	}

	/**
	 * Get the current offset.
	 */
	public get offset() {
		return this._offset;
	}

	/**
	 * Set the current offset.
	 */
	public set offset(value: number) {
		assertIntegerRange(value, 'value', 0, this.size);
		this._offset = value;
	}

	/**
	 * Remaining bytes from offset.
	 */
	public get remaining() {
		return this.size - this.offset;
	}

	/**
	 * Assert remaining size for optional offset.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @param size The number of bytes.
	 */
	public assertRemaining(size: number = -1, offset = -1) {
		if (offset < 0) {
			if (size >= 0) {
				assertIntegerRange(size, 'size', 0, this.remaining);
			}
		}
		else {
			assertIntegerRange(offset, 'offset', 0, this.size);
			if (size >= 0) {
				assertIntegerRange(size, 'size', 0, this.size - offset);
			}
		}
	}

	/**
	 * Assert view is writable.
	 */
	public assertWritable() {
		if (this._readonly) {
			throw new ExceptionReadonly('Marked readonly');
		}
	}

	/**
	 * Copy view and the underlying buffer, offset is not copied.
	 *
	 * @param readonly Optionally mark the instance read only.
	 * @return Copied instance.
	 */
	public copy(readonly = false) {
		// Get data view as an array, copying data.
		const d = viewAs8Array(Uint8Array, this._dataview, true);

		// Create a new view from the copied data.
		return new BufferView(d, this.endianL, 0, -1, readonly);
	}

	/**
	 * Get a sub view of the current view, using same underlying buffer.
	 *
	 * @param size If non-negative, use specificed, else uses remaining size.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @param readonly Optionally mark the instance read only.
	 * @return New instance.
	 */
	public getView(size = -1, offset = -1, readonly = false) {
		this.assertRemaining(size, offset);
		offset = offset < 0 ? this.offset : offset;
		readonly = this.readonly || readonly;

		// Create a sub view of the current view.
		const d = this._dataview;
		return new BufferView(d, this.endianL, offset, size, readonly);
	}

	/**
	 * Read a sub view of the current view, using same underlying buffer.
	 *
	 * @param size If non-negative, use specificed, else uses remaining size.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @param readonly Optionally mark the instance read only.
	 * @return New instance.
	 */
	public readView(size = -1, readonly = false) {
		const r = this.getView(size, -1, readonly);
		this.offset += r.size;
		return r;
	}

	/**
	 * Set a buffer view onto the current view.
	 *
	 * @param data Buffer view of data.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	public setView(data: BufferView, offset = -1) {
		this.assertWritable();
		this.assertRemaining(data.size, offset);
		offset = offset < 0 ? this.offset : offset;

		// Get this and other data view as a typed array.
		const aT = viewAs8Array(Uint8Array, this._dataview);
		const aO = viewAs8Array(Uint8Array, data._dataview);

		// Copy the other buffer into this one at specificed offset.
		// Method is smart enough to handle same source and destination.
		aT.set(aO, offset);
	}

	/**
	 * Write a buffer view onto the current view.
	 *
	 * @param data Buffer view of data.
	 */
	public writeView(data: BufferView) {
		this.setView(data);
		this.offset += data.size;
	}

	// Int8:

	// Int8: Get:

	/**
	 * Get Int8S.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public getInt8S(offset = -1) {
		return this._intGR(8, false, false, offset, false);
	}

	/**
	 * Get Int8U.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public getInt8U(offset = -1) {
		return this._intGR(8, true, false, offset, false);
	}

	// Int8: Set:

	/**
	 * Set Int8S.
	 *
	 * @param value Integer value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public setInt8S(value: number, offset = -1) {
		this._intSW(value, 8, false, false, offset, false);
	}

	/**
	 * Set Int8U.
	 *
	 * @param value Integer value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public setInt8U(value: number, offset = -1) {
		this._intSW(value, 8, true, false, offset, false);
	}

	// Int8: Read:

	/**
	 * Read Int8S.
	 *
	 * @return Integer value.
	 */
	public readInt8S() {
		return this._intGR(8, false, false, -1, true);
	}

	/**
	 * Read Int8U.
	 *
	 * @return Integer value.
	 */
	public readInt8U() {
		return this._intGR(8, true, false, -1, true);
	}

	// Int8: Write:

	/**
	 * Write Int8S.
	 *
	 * @param value Integer value.
	 * @return Integer value.
	 */
	public writeInt8S(value: number) {
		this._intSW(value, 8, false, false, -1, true);
	}

	/**
	 * Write Int8U.
	 *
	 * @param value Integer value.
	 * @return Integer value.
	 */
	public writeInt8U(value: number) {
		this._intSW(value, 8, true, false, -1, true);
	}

	// Int16:

	// Int16: Get:

	/**
	 * Get Int16S.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public getInt16S(offset = -1) {
		return this._intGR(16, false, this.endianL, offset, false);
	}

	/**
	 * Get Int16U.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public getInt16U(offset = -1) {
		return this._intGR(16, true, this.endianL, offset, false);
	}

	// Int16: Set:

	/**
	 * Set Int16S.
	 *
	 * @param value Integer value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	public setInt16S(value: number, offset = -1) {
		this._intSW(value, 16, false, this.endianL, offset, false);
	}

	/**
	 * Set Int16U.
	 *
	 * @param value Integer value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	public setInt16U(value: number, offset = -1) {
		this._intSW(value, 16, true, this.endianL, offset, false);
	}

	// Int16: Read:

	/**
	 * Read Int16S.
	 *
	 * @return Integer value.
	 */
	public readInt16S() {
		return this._intGR(16, false, this.endianL, -1, true);
	}

	/**
	 * Read Int16U.
	 *
	 * @return Integer value.
	 */
	public readInt16U() {
		return this._intGR(16, true, this.endianL, -1, true);
	}

	// Int16: Write:

	/**
	 * Write Int16S.
	 *
	 * @param value Integer value.
	 */
	public writeInt16S(value: number) {
		this._intSW(value, 16, false, this.endianL, -1, true);
	}

	/**
	 * Write Int16U.
	 *
	 * @param value Integer value.
	 */
	public writeInt16U(value: number) {
		this._intSW(value, 16, true, this.endianL, -1, true);
	}

	// Int32:

	// Int32: Get:

	/**
	 * Get Int32S.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public getInt32S(offset = -1) {
		return this._intGR(32, false, this.endianL, offset, false);
	}

	/**
	 * Get Int32U.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	public getInt32U(offset = -1) {
		return this._intGR(32, true, this.endianL, offset, false);
	}

	// Int32: Set:

	/**
	 * Set Int32S.
	 *
	 * @param value Integer value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	public setInt32S(value: number, offset = -1) {
		this._intSW(value, 32, false, this.endianL, offset, false);
	}

	/**
	 * Set Int32U.
	 *
	 * @param value Integer value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	public setInt32U(value: number, offset = -1) {
		this._intSW(value, 32, true, this.endianL, offset, false);
	}

	// Int32: Read:

	/**
	 * Read Int32S.
	 *
	 * @return Integer value.
	 */
	public readInt32S() {
		return this._intGR(32, false, this.endianL, -1, true);
	}

	/**
	 * Read Int32U.
	 *
	 * @return Integer value.
	 */
	public readInt32U() {
		return this._intGR(32, true, this.endianL, -1, true);
	}

	// Int32: Write:

	/**
	 * Write Int32S.
	 *
	 * @param value Integer value.
	 */
	public writeInt32S(value: number) {
		this._intSW(value, 32, false, this.endianL, -1, true);
	}

	/**
	 * Write Int32U.
	 *
	 * @param value Integer value.
	 */
	public writeInt32U(value: number) {
		this._intSW(value, 32, true, this.endianL, -1, true);
	}

	// Float32:

	// Float32: Get:

	/**
	 * Get Float32.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Float value.
	 */
	public getFloat32(offset = -1) {
		return this._floatGR(32, this.endianL, offset, false);
	}

	// Float32: Set:

	/**
	 * Set Float32.
	 *
	 * @param value Float value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	public setFloat32(value: number, offset = -1) {
		this._floatSW(value, 32, this.endianL, offset, false);
	}

	// Float32: Read:

	/**
	 * Read Float32.
	 *
	 * @return Float value.
	 */
	public readFloat32() {
		return this._floatGR(32, this.endianL, -1, true);
	}

	// Float32: Write:

	/**
	 * Write Float32.
	 *
	 * @param value Float value.
	 */
	public writeFloat32(value: number) {
		this._floatSW(value, 32, this.endianL, -1, true);
	}

	// Float64:

	// Float64: Get:

	/**
	 * Get Float64.
	 *
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Float value.
	 */
	public getFloat64(offset = -1) {
		return this._floatGR(64, this.endianL, offset, false);
	}

	// Float64: Set:

	/**
	 * Set Float64.
	 *
	 * @param value Float value.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	public setFloat64(value: number, offset = -1) {
		this._floatSW(value, 64, this.endianL, offset, false);
	}

	// Float64: Read:

	/**
	 * Read Float64.
	 *
	 * @return Float value.
	 */
	public readFloat64() {
		return this._floatGR(64, this.endianL, -1, true);
	}

	// Float64: Write:

	/**
	 * Write Float64.
	 *
	 * @param value Float value.
	 */
	public writeFloat64(value: number) {
		this._floatSW(value, 64, this.endianL, -1, true);
	}

	/**
	 * Get readable from buffer.
	 *
	 * @param readable Readable object.
	 * @param offset Offset to get from.
	 * @param size Size read.
	 */
	public getReadable(readable: IBufferReadable, offset = -1, size = [0]) {
		const view = this.getView(-1, offset, true);
		readable.bufferRead(view);
		size[0] = view.offset;
	}

	/**
	 * Set writable to buffer.
	 *
	 * @param writable Writable object.
	 * @param offset Offset to set from.
	 * @param size Size wrote.
	 */
	public setWritable(writable: IBufferWriteable, offset = -1, size = [0]) {
		const view = this.getView(-1, offset, false);
		writable.bufferWrite(view);
		size[0] = view.offset;
	}

	/**
	 * Read readable from buffer.
	 *
	 * @param readable Readable object.
	 * @param size Size read.
	 */
	public readReadable(readable: IBufferReadable, size = [0]) {
		this.getReadable(readable, -1, size);
		this.offset += size[0];
	}

	/**
	 * Write writable to buffer.
	 *
	 * @param writable Writable object.
	 * @param size Size wrote.
	 */
	public writeWritable(writable: IBufferWriteable, size = [0]) {
		this.setWritable(writable, -1, size);
		this.offset += size[0];
	}

	/**
	 * Get a readable new from buffer.
	 *
	 * @param readable ReadableNew object.
	 * @param offset Offset to get from.
	 * @param size Size read.
	 */
	public getReadableNew<
		T extends IBufferReadableNew
	>(
		readable: T, offset = -1, size = [0]
	) {
		const view = this.getView(-1, offset, true);
		const r = readable.bufferReadNew(view);
		size[0] = view.offset;
		return r;
	}

	/**
	 * Read a readable new from buffer.
	 *
	 * @param readable ReadableNew object.
	 * @param size Size read.
	 */
	public readReadableNew<
		T extends IBufferReadableNew
	>(
		readable: T, size = [0]
	) {
		const r = this.getReadableNew(readable, -1, size);
		this.offset += size[0];
		return r;
	}

	/**
	 * Compare two instances data, offset ignored.
	 *
	 * @param other Other instance.
	 * @return Index of the first bifferent byte, or -1.
	 */
	public compare(other: BufferView) {
		const dT = this._dataview;
		const dO = other._dataview;
		const sizeT = this.size;
		const sizeO = other.size;
		const sizeCompare = sizeT < sizeO ? sizeT : sizeO;

		// Amount we can compare using uint32.
		const sizeCompareFast = sizeCompare - (sizeCompare % 4);

		// Compare 4 bytes at a time, little endian.
		for (let i = 0; i < sizeCompareFast; i += 4) {
			const vT = dT.getUint32(i, true);
			const vO = dO.getUint32(i, true);

			// If it does not match, find the byte that differed.
			if (vT === vO) {
				continue;
			}

			// tslint:disable-next-line: no-bitwise
			if ((vT & 0xFF) !== (vO & 0xFF)) {
				return i;
			}
			// tslint:disable-next-line: no-bitwise
			if ((vT & 0xFF00) !== (vO & 0xFF00)) {
				return i + 1;
			}
			// tslint:disable-next-line: no-bitwise
			if ((vT & 0xFF0000) !== (vO & 0xFF0000)) {
				return i + 2;
			}
			return i + 3;
		}

		// Compare the rest 1 byte at a time.
		for (let i = sizeCompareFast; i < sizeCompare; i++) {
			const vT = dT.getUint8(i);
			const vO = dO.getUint8(i);
			if (vT !== vO) {
				return i;
			}
		}

		// If sizes are equal, return -1, else return comparison end.
		return sizeT === sizeO ? -1 : sizeCompare;
	}

	/**
	 * Create a new ArrayBuffer from data, copying buffer.
	 *
	 * @return The ArrayBuffer.
	 */
	public toArrayBuffer() {
		return this.toUint8Array().buffer;
	}

	/**
	 * Create a new DataView from data, copying buffer.
	 *
	 * @return The DataView.
	 */
	public toDataView() {
		return new DataView(this.toArrayBuffer());
	}

	/**
	 * Create a new Int8Array from data, copying buffer.
	 *
	 * @return The Int8Array.
	 */
	public toInt8Array() {
		return viewAs8Array(Int8Array, this._dataview, true);
	}

	/**
	 * Create a new Uint8Array from data, copying buffer.
	 *
	 * @return The Uint8Array.
	 */
	public toUint8Array() {
		return viewAs8Array(Uint8Array, this._dataview, true);
	}

	/**
	 * Create an array of hex encoded bytes from the data.
	 *
	 * @return Array of hex characters.
	 */
	public toHexArray() {
		const a = viewAs8Array(Uint8Array, this._dataview);
		const r: string[] = new Array(a.length);
		for (let i = 0; i < a.length; i++) {
			const v = a[i];
			r[i] = (v < 0x10 ? '0' : '') + v.toString(16).toUpperCase();
		}
		return r;
	}

	/**
	 * Create optionally delimited string of hex encoded bytes from data.
	 *
	 * @param delimiter An optional delimiter string.
	 * @return Array of hex characters.
	 */
	public toHex(delimiter = '') {
		return this.toHexArray().join(delimiter);
	}

	/**
	 * Create new instance with fresh underlying buffer data.
	 *
	 * @param size Size of new instance.
	 * @param endianL True for little endian, false for big endian.
	 * @param readonly Optionally mark the instance read only.
	 * @return New instance.
	 */
	public static fromSize(size: number, endianL: boolean, readonly = false) {
		// ArrayBuffer will very likely throw on max size.
		assertIntegerRange(size, 'size', 0, MAX_SAFE_INTEGER);
		const buffer = new ArrayBuffer(size);
		return new BufferView(buffer, endianL, 0, -1, readonly);
	}

	/**
	 * Create new instance from array of hex characters.
	 *
	 * @param hex Hex characters.
	 * @param endianL True for little endian, false for big endian.
	 * @param readonly Optionally mark the instance read only.
	 * @return New instance.
	 */
	public static fromHexArray(
		hex: string[], endianL: boolean, readonly = false
	) {
		const size = hex.length;
		assertIntegerRange(size, 'size', 0, MAX_SAFE_INTEGER);
		const a = new Uint8Array(size);
		for (let i = 0; i < size; i++) {
			const byte = hex[i];
			if (!regexHex.test(byte)) {
				throw new ExceptionValue(`Invalid hex character: ${byte}`);
			}
			a[i] = parseInt(byte, 16);
		}
		return new BufferView(a, endianL, 0, -1, readonly);
	}

	/**
	 * Create new instance from a string of hex characters.
	 * This function skips non-hex characters in the string.
	 *
	 * @param hex Hex characters.
	 * @param endianL True for little endian, false for big endian.
	 * @param readonly Optionally mark the instance read only.
	 * @return New instance.
	 */
	public static fromHex(hex: string, endianL: boolean, readonly = false) {
		const matched = hex.replace(regexNoHex, '').match(regexUpTo2C) || [];
		const size = matched.length;
		assertIntegerRange(size, 'size', 0, MAX_SAFE_INTEGER);
		const a = new Uint8Array(size);
		for (let i = 0; i < size; i++) {
			a[i] = parseInt(matched[i], 16);
		}
		return new BufferView(a, endianL, 0, -1, readonly);
	}

	/**
	 * Format for Node console.
	 *
	 * @param depth Inspect depth.
	 * @param opts Inspect options.
	 * @return Formatted string.
	 */
	public inspect(depth: number, opts: NodeJS.InspectOptions) {
		return (
			`${this.constructor.name} { ` +
			[
				`size: ${this.size}`,
				`offset: ${this.offset}`,
				`endianL: ${this.endianL}`,
				`readonly: ${this.readonly}`
			].join(', ') +
			' }'
		);
	}

	/**
	 * Concatenate multiple buffers together.
	 *
	 * @param endianL True for little endian, false for big endian.
	 * @param datas Instances to merge together.
	 * @param readonly Optionally mark the instance read only.
	 * @return Merged instance.
	 */
	public static concat(
		datas: BufferView[], endianL: boolean, readonly = false
	) {
		let size = 0;

		// Compute the full size.
		for (const data of datas) {
			size += data.size;
		}

		// Create a typed array that is full size.
		const bytes = new Uint8Array(size);

		// Set the data and seek with each offset.
		let offset = 0;

		// Set the data and seek with each offset.
		for (const data of datas) {
			const a = viewAs8Array(Uint8Array, data._dataview);
			bytes.set(a, offset);
			offset += data.size;
		}

		// Create new instance with this data.
		return new BufferView(bytes, endianL, 0, -1, readonly);
	}

	/**
	 * Integer get or read.
	 *
	 * @param bits Integer bits.
	 * @param unsigned True for unsigned, false for signed.
	 * @param endianL True for little endian, false for big endian.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	protected _intGR(
		bits: number,
		unsigned: boolean,
		endianL: boolean,
		offset: number,
		read: boolean
	) {
		offset = offset < 0 ? this.offset : offset;
		const size = bits / 8;
		let r;
		switch (bits) {
			case 8: {
				this.assertRemaining(size, offset);
				r = unsigned ?
					this._dataview.getUint8(offset) :
					this._dataview.getInt8(offset);
				break;
			}
			case 16: {
				this.assertRemaining(size, offset);
				r = unsigned ?
					this._dataview.getUint16(offset, endianL) :
					this._dataview.getInt16(offset, endianL);
				break;
			}
			case 32: {
				this.assertRemaining(size, offset);
				r = unsigned ?
					this._dataview.getUint32(offset, endianL) :
					this._dataview.getInt32(offset, endianL);
				break;
			}
			default: {
				throw exceptionInvalidBitsSize(bits);
			}
		}
		if (read) {
			this.offset += size;
		}
		return r;
	}

	/**
	 * Integer set or write.
	 *
	 * @param value Integer value.
	 * @param bits Integer bits.
	 * @param unsigned True for unsigned, false for signed.
	 * @param endianL True for little endian, false for big endian.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	protected _intSW(
		value: number,
		bits: number,
		unsigned: boolean,
		endianL: boolean,
		offset: number,
		write: boolean
	) {
		this.assertWritable();
		offset = offset < 0 ? this.offset : offset;
		const size = bits / 8;
		switch (bits) {
			case 8: {
				this.assertRemaining(size, offset);
				if (unsigned) {
					assertIntegerRange(value, 'value', INT8U_MIN, INT8U_MAX);
					this._dataview.setUint8(offset, value);
				}
				else {
					assertIntegerRange(value, 'value', INT8S_MIN, INT8S_MAX);
					this._dataview.setInt8(offset, value);
				}
				break;
			}
			case 16: {
				this.assertRemaining(size, offset);
				if (unsigned) {
					assertIntegerRange(value, 'value', INT16U_MIN, INT16U_MAX);
					this._dataview.setUint16(offset, value, endianL);
				}
				else {
					assertIntegerRange(value, 'value', INT16S_MIN, INT16S_MAX);
					this._dataview.setInt16(offset, value, endianL);
				}
				break;
			}
			case 32: {
				this.assertRemaining(size, offset);
				if (unsigned) {
					assertIntegerRange(value, 'value', INT32U_MIN, INT32U_MAX);
					this._dataview.setUint32(offset, value, endianL);
				}
				else {
					assertIntegerRange(value, 'value', INT32S_MIN, INT32S_MAX);
					this._dataview.setInt32(offset, value, endianL);
				}
				break;
			}
			default: {
				throw exceptionInvalidBitsSize(bits);
			}
		}
		if (write) {
			this.offset += size;
		}
	}

	/**
	 * Float get or read.
	 *
	 * @param bits Float bits.
	 * @param endianL True for little endian, false for big endian.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 * @return Integer value.
	 */
	protected _floatGR(
		bits: number,
		endianL: boolean,
		offset: number,
		read: boolean
	) {
		offset = offset < 0 ? this.offset : offset;
		const size = bits / 8;
		let r;
		switch (bits) {
			case 32: {
				this.assertRemaining(size, offset);
				r = this._dataview.getFloat32(offset, endianL);
				break;
			}
			case 64: {
				this.assertRemaining(size, offset);
				r = this._dataview.getFloat64(offset, endianL);
				break;
			}
			default: {
				throw exceptionInvalidBitsSize(bits);
			}
		}
		if (read) {
			this.offset += size;
		}
		return r;
	}

	/**
	 * Float set or write.
	 *
	 * @param value Float value.
	 * @param bits Float bits.
	 * @param endianL True for little endian, false for big endian.
	 * @param offset If non-negative, use specificed, else uses current offset.
	 */
	protected _floatSW(
		value: number,
		bits: number,
		endianL: boolean,
		offset: number,
		write: boolean
	) {
		this.assertWritable();
		offset = offset < 0 ? this.offset : offset;
		const size = bits / 8;
		switch (bits) {
			case 32: {
				this.assertRemaining(size, offset);
				this._dataview.setFloat32(offset, value, endianL);
				break;
			}
			case 64: {
				this.assertRemaining(size, offset);
				this._dataview.setFloat64(offset, value, endianL);
				break;
			}
			default: {
				throw exceptionInvalidBitsSize(bits);
			}
		}
		if (write) {
			this.offset += size;
		}
	}
}
