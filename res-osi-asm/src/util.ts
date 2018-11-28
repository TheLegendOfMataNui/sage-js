/**
 * Format an error message at a file location.
 *
 * @param message Error message.
 * @param line Line number, 1 indexed.
 * @param column Column number, 1 indexed.
 * @param filename Optinal filename.
 * @return Formatted string.
 */
export function utilFormatErrorAtFileLocation(
	message: string,
	line: number,
	column: number,
	filename = ''
) {
	const f = filename ? `${filename}:` : '';
	return `${message} @ ${f}${line}:${column}`;
}
