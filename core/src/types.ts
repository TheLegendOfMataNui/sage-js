import {BufferView} from './bufferview';

export type TypedArraySint = Int8Array | Int16Array | Int32Array;
export type TypedArrayUint = Uint8Array | Uint16Array | Uint32Array;
export type TypedArrayUintC = Uint8ClampedArray;
export type TypedArrayFloat = Float32Array | Float64Array;

export type TypedArray =
	TypedArraySint |
	TypedArrayUint |
	TypedArrayUintC |
	TypedArrayFloat;

export type ArrayBuffers = ArrayBuffer | SharedArrayBuffer;

export interface IArrayBufferView {
	/**
	 * The expected buffer property.
	 */
	buffer: ArrayBuffers;

	/**
	 * The expected byteLength property.
	 */
	byteLength: number;

	/**
	 * The expected byteOffset property.
	 */
	byteOffset: number;
}

export interface IBufferReadable {
	/**
	 * Read method.
	 */
	bufferRead(data: BufferView): void;
}

export interface IBufferWriteable {
	/**
	 * Write method.
	 */
	bufferWrite(data: BufferView): void;
}

export interface IBufferReadableNew {
	/**
	 * Read method.
	 */
	bufferReadNew(data: BufferView): this;
}

export interface ICreateNew {
	/**
	 * Method to create a new instance of the referenced object.
	 */
	createNew(): this;
}

export interface ICopyable {
	/**
	 * Method to copy an object instance.
	 */
	copy(): this;
}
