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
	buffer: ArrayBuffers;
	byteLength: number;
	byteOffset: number;
}

export interface IBufferReadable {
	bufferRead(data: BufferView): void;
}

export interface IBufferWriteable {
	bufferWrite(data: BufferView): void;
}

export interface IBufferReadableNew {
	bufferReadNew(data: BufferView): this;
}

export interface ICreateNew {
	createNew(): this;
}

export interface ICopyable {
	copy(): this;
}

// Similar to InstanceType, but works with abstract classes.
// export type InstanceofType<T> =
// 	// tslint:disable-next-line: no-unused
// 	T extends new (...args: any[]) => infer R ? R : any;
