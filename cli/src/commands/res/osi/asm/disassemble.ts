import {createHash} from 'crypto';
import {flags} from '@oclif/command';
import {BufferView} from '@sage-js/core';
import {OSI} from '@sage-js/res-osi';
import {
	AssemblyDisassembler,
	ParserEncoder,
	ASTNodeStatementLine
} from '@sage-js/res-osi-asm';
import {
	readFile,
	writeFile
} from 'fs-extra';
import {NAME, VERSION} from '../../../../meta';
import {Command} from '../../../../command';

/**
 * ResOSIASMDisassemble command.
 */
export default class ResOSIASMDisassemble extends Command {

	/**
	 * Aliases.
	 */
	public static aliases = [
		'res:osi:asm:d'
	];

	/**
	 * Description.
	 */
	public static description = 'disassemble an osi file';

	/**
	 * Examples.
	 */
	public static examples = [];

	/**
	 * Flags.
	 */
	public static flags = {
		help: flags.help({char: 'h'}),
		'no-transform-string': flags.boolean({
			description: 'no transform string inline'
		}),
		'no-transform-symbol': flags.boolean({
			description: 'no transform symbol inline'
		}),
		'no-transform-jump': flags.boolean({
			description:
				'no transform jump targets (not position independent)'
		}),
		'no-transform-branch': flags.boolean({
			description:
				'no transform branch targets (not position independent)'
		})
	};

	/**
	 * Arguments.
	 */
	public static args = [
		{
			name: 'osi',
			required: true,
			description: 'osi file to disassemble'
		},
		{
			name: 'asm',
			required: true,
			description: 'assembly file to output'
		}
	];

	/**
	 * Handler.
	 */
	public async run() {
		// tslint:disable-next-line: no-unused
		const {args, flags} = this.parse(ResOSIASMDisassemble);

		// Read file and compute a hash.
		const buffer = await readFile(args.osi);
		const sha256 = createHash('sha256')
			.update(buffer)
			.digest('hex')
			.toUpperCase();

		// Read the OSI data form the buffer.
		const view = new BufferView(buffer, true, 0, -1, true);
		const osi = new OSI();
		view.readReadable(osi);

		// Transform BCL instructions to abstract instructions, unless disabled.
		if (!flags['no-transform-jump']) {
			osi.transformAbstractJumpAdd();
		}
		if (!flags['no-transform-branch']) {
			osi.transformAbstractBranchAdd();
		}
		if (!flags['no-transform-string']) {
			osi.transformAbstractStringAdd();
		}
		if (!flags['no-transform-symbol']) {
			osi.transformAbstractSymbolAdd();
		}

		// Disassemble OSI data to an AST.
		const disassembler = new AssemblyDisassembler();
		const ast = disassembler.disassemble(osi);

		// Add banner comments to the AST.
		const banner = [
			`Generator: ${NAME}: ${VERSION}`,
			`SHA256: ${sha256}`,
			''
		];
		ast.statements.entries.unshift(...banner.map(str => {
			const line = new ASTNodeStatementLine();
			line.comment.text = str ? '; ' + str : '';
			return line;
		}));

		// Encode AST to ASM.
		const encoder = new ParserEncoder();
		const asm = encoder.encode(ast);

		// Write ASM to file.
		await writeFile(args.asm, asm, {
			encoding: 'utf8'
		});
	}
}
