import {flags} from '@oclif/command';
import {BufferView} from '@sage-js/core';
import {
	AssemblyAssembler,
	ParserDecoder
} from '@sage-js/res-osi-asm';
import {
	readFile,
	writeFile
} from 'fs-extra';
import {Command} from '../../../../command';

/**
 * ResOSIASMAssemble command.
 */
export default class ResOSIASMAssemble extends Command {

	/**
	 * Aliases.
	 */
	public static aliases = [
		'res:osi:asm:a'
	];

	/**
	 * Description.
	 */
	public static description = 'assemble an osi file';

	/**
	 * Examples.
	 */
	public static examples = [];

	/**
	 * Flags.
	 */
	public static flags = {
		help: flags.help({char: 'h'})
	};

	/**
	 * Arguments.
	 */
	public static args = [
		{
			name: 'asm',
			required: true,
			description: 'assembly file to assemble'
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
		const {args, flags} = this.parse(ResOSIASMAssemble);

		// Read file and compute a hash.
		const asm = await readFile(args.asm, {
			encoding: 'utf8'
		});

		// Decode ASM to AST.
		const decoder = new ParserDecoder();
		const ast = decoder.decode(asm, args.asm);

		// Throw for syntax errors.
		// TODO: Better error messages:
		for (const syntaxError of decoder.syntaxErrors) {
			throw syntaxError;
		}

		// Assemble AST to OSI.
		const assembler = new AssemblyAssembler();
		// TODO: Better error messages:
		const osi = assembler.assemble(ast);

		// Transform abstract instructions to BCL instructions.
		osi.transformAbstractJumpRemove();
		osi.transformAbstractBranchRemove();
		osi.transformAbstractStringRemove();
		osi.transformAbstractSymbolRemove();
		osi.transformAbstractGlobalRemove();
		osi.updateOffsets();

		// Write OSI to buffer.
		const buffer = Buffer.alloc(osi.size);
		const view = new BufferView(buffer, true);
		view.writeWritable(osi);

		// Write buffer to file.
		await writeFile(args.osi, buffer);
	}
}
