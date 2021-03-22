/* eslint-disable import/no-default-export */
import {join as pathJoin} from 'path';

import {flags} from '@oclif/command';
import {BufferView} from '@sage-js/core';
import {
	AssemblyAssemblerStructured,
	ParserDecoder,
	ASTNodeFile
} from '@sage-js/res-osi-asm';
import {
	readFile,
	writeFile,
	stat,
	readdir,
	realpath
} from 'fs-extra';

import {OSI_ASMS_PROJECT_SOURCE_EXT} from '../../../../constants';
import {Command} from '../../../../command';

/**
 * ResOSIASMSAssemble command.
 */
export default class ResOSIASMSAssemble extends Command {
	/**
	 * Aliases.
	 */
	public static readonly aliases = [
		'res:osi:asm:sa'
	];

	/**
	 * Description.
	 */
	public static readonly description = (
		'assemble an osi file, structured assembly'
	);

	/**
	 * Examples.
	 */
	public static readonly examples = [];

	/**
	 * Flags.
	 */
	public static readonly flags = {
		help: flags.help({char: 'h'}),
		ext: flags.string({
			char: 'e',
			default: OSI_ASMS_PROJECT_SOURCE_EXT,
			description: 'project sources file extensions'
		})
	};

	/**
	 * Arguments.
	 */
	public static readonly args = [
		{
			name: 'osi',
			required: true,
			description: 'osi file to output'
		},
		{
			name: 'asms',
			required: true,
			description: 'list of assembly files or directories to assemble'
		}
	];

	/**
	 * Allow variable length arguments.
	 */
	public static readonly strict = false;

	/**
	 * Handler.
	 */
	public async run() {
		const {args, flags, argv} = this.parse(ResOSIASMSAssemble);
		const outpath = args.osi;
		const inpaths = argv.slice(1);
		const ext = flags.ext || OSI_ASMS_PROJECT_SOURCE_EXT;

		// List sources.
		const sources = await this._findSources(inpaths, ext);

		// Read sources into AST files list.
		const asms = await this._readSources(sources);

		// Assemble AST to OSI.
		const assembler = new AssemblyAssemblerStructured();
		// TODO: Better error messages:
		const osi = assembler.assembles(asms);

		// Transform abstract instructions to BCL instructions.
		osi.transformAbstractClassRemove();
		osi.transformAbstractGlobalRemove();
		osi.transformAbstractSymbolRemove();
		osi.transformAbstractStringRemove();
		osi.updateOffsets();
		osi.transformAbstractBranchRemove();
		osi.transformAbstractJumpRemove();

		// Not strictly necessary, but better to fail here if wrong.
		osi.transformClassExtendsRemove();

		// Write OSI to buffer.
		const buffer = Buffer.alloc(osi.size);
		const view = new BufferView(buffer, true);
		view.writeWritable(osi);

		// Write buffer to file.
		await writeFile(outpath, buffer);
	}

	/**
	 * Find source files from path list.
	 *
	 * @param filepaths Paths to find sources.
	 * @param ext File extension, should not be empty.
	 * @returns The sources.
	 */
	protected async _findSources(filepaths: string[], ext: string) {
		const r: string[] = [];
		const visited = new Set<string>();
		const queue = [...filepaths];
		while (queue.length) {
			const entry = queue.shift();
			if (!entry) {
				continue;
			}

			// Skip if this path has already been visited.
			// eslint-disable-next-line no-await-in-loop
			const real = await realpath(entry);
			if (visited.has(real)) {
				continue;
			}
			visited.add(real);

			// Stat path, check check file, descend if directory.
			// eslint-disable-next-line no-await-in-loop
			const statInfo = await stat(entry);
			const isDir = statInfo.isDirectory();
			if (!isDir) {
				// If correct file extension, add to the list.
				if (entry.endsWith(ext)) {
					r.push(entry);
				}
				continue;
			}

			// List directory, skipping any dot files.
			// eslint-disable-next-line no-await-in-loop
			const dirList = await readdir(real);
			for (const p of dirList) {
				if (!p || p.startsWith('.')) {
					continue;
				}
				queue.push(pathJoin(entry, p));
			}
		}
		return r.sort();
	}

	/**
	 * Read sources.
	 *
	 * @param filepaths Paths of source file.
	 * @returns The sources.
	 */
	protected async _readSources(filepaths: string[]) {
		const r: ASTNodeFile[] = [];
		for (const filepath of filepaths) {
			// eslint-disable-next-line no-await-in-loop
			r.push(await this._readSource(filepath));
		}
		return r;
	}

	/**
	 * Read source.
	 *
	 * @param filepath Path of source file.
	 * @returns The AST.
	 */
	protected async _readSource(filepath: string) {
		// Read file.
		const asm = await readFile(filepath, {
			encoding: 'utf8'
		});

		// Decode ASM to AST.
		const decoder = new ParserDecoder();
		const ast = decoder.decode(asm, filepath);

		// Throw for syntax errors.
		// TODO: Better error messages:
		for (const syntaxError of decoder.syntaxErrors) {
			throw syntaxError;
		}

		return ast;
	}
}
