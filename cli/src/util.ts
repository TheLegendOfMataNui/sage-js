import {dirname} from 'path';
import {promises} from 'fs';

const {
	writeFile,
	mkdir
} = promises;

/**
 * Output file, creating directory if necessary.
 *
 * @param file File path.
 * @param data File data.
 */
export async function outputFile(file: string, data: any) {
	const dir = dirname(file);
	await mkdir(dir, {
		recursive: true
	});
	await writeFile(file, data);
}
