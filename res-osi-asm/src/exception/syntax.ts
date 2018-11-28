import {typed} from '../typed';
import {utilFormatErrorAtFileLocation} from '../util';
import {SourceFile} from '../sourcefile';
import {Exception} from './class';

/**
 * ExceptionSyntax constructor.
 *
 * @param message Exception message.
 * @param line Line number.
 * @param column Column number.
 */
@typed.decorateException('ExceptionSyntax')
export class ExceptionSyntax extends Exception {
	/**
	 * Source file.
	 */
	public readonly file: SourceFile;

	/**
	 * Line number.
	 */
	public readonly line: number;

	/**
	 * Column number.
	 */
	public readonly column: number;

	constructor(
		message: string,
		file: SourceFile,
		line: number,
		column: number
	) {
		super(utilFormatErrorAtFileLocation(message, line, column, file.name));
		this.file = file;
		this.line = line;
		this.column = column;
	}
}
