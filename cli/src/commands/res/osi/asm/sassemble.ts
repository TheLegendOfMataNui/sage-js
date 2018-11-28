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
	stat
} from 'fs-extra';

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
	public static readonly description =
		'assemble an osi file, structured assembly';

	/**
	 * Examples.
	 */
	public static readonly examples = [];

	/**
	 * Flags.
	 */
	public static readonly flags = {
		help: flags.help({char: 'h'})
	};

	/**
	 * Arguments.
	 */
	public static readonly args = [
		{
			name: 'asm',
			required: true,
			description: 'assembly code to assemble'
		},
		{
			name: 'osi',
			required: true,
			description: 'osi file to output'
		}
	];

	/**
	 * Handler.
	 */
	public async run() {
		// tslint:disable-next-line: no-unused
		const {args, flags} = this.parse(ResOSIASMSAssemble);

		const inpath = args.asm;

		const inpathStat = await stat(inpath);

		let sources: ASTNodeFile[] | null = null;
		if (inpathStat.isDirectory()) {
			// TODO: Project.
			sources = [];
		}
		else {
			const source = await this._readSourceFile(inpath);
			sources = [source];
		}

		// Assemble AST to OSI.
		const assembler = new AssemblyAssemblerStructured();
		// TODO: Better error messages:
		const osi = assembler.assembles(sources);

		// Transform abstract instructions to BCL instructions.
		osi.transformAbstractClassRemove();
		osi.transformAbstractGlobalRemove();
		osi.transformAbstractSymbolRemove();
		osi.transformAbstractStringRemove();
		osi.updateOffsets();
		osi.transformAbstractBranchRemove();
		osi.transformAbstractJumpRemove();

		// Write OSI to buffer.
		const buffer = Buffer.alloc(osi.size);
		const view = new BufferView(buffer, true);
		view.writeWritable(osi);

		// Write buffer to file.
		await writeFile(args.osi, buffer);
	}

	/**
	 * Read file.
	 *
	 * @param filepath Path of source file.
	 * @param basedir Base directory.
	 */
	protected async _readSourceFile(filepath: string, basedir: string = '') {
		// Create the full path.
		const fp = basedir ? pathJoin(basedir, filepath) : filepath;

		// Read file.
		const asm = await readFile(fp, {
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
