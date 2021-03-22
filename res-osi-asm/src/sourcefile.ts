import {utilNormalizeNewlines} from '@sage-js/core';

/**
 * SourceFile constructor.
 */
export class SourceFile extends Object {
	/**
	 * File code.
	 */
	public readonly code: string;

	/**
	 * File name.
	 */
	public readonly name: string;

	constructor(code: string, name = '') {
		super();
		this.code = code;
		this.name = name;

		// Make sure values are not modified by mistake.
		Object.defineProperty(this, 'code', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: code
		});
		Object.defineProperty(this, 'name', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: name
		});
	}

	/**
	 * Get source file lines, 0 indexed.
	 *
	 * @param start Start index.
	 * @param end End index.
	 * @returns Source lines in range.
	 */
	public getLines(start = 0, end = -1) {
		const lines = utilNormalizeNewlines(this.code).split('\n');
		if (start < 1 && end < 0) {
			return lines;
		}
		return end < 0 ? lines.slice(start) : lines.slice(start, end);
	}
}
