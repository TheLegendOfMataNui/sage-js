import {createHash} from 'crypto';
import {join as pathJoin} from 'path';
import {flags} from '@oclif/command';
import {
	BufferView,
	utilFilenameEncode
} from '@sage-js/core';
import {OSI} from '@sage-js/res-osi';
import {
	IDisassemblyStructuredFileMapper,
	AssemblyDisassemblerStructured,
	ParserEncoder,
	ASTNodeStatementLine,
	MapSubroutineReferenceCount
} from '@sage-js/res-osi-asm';
import {
	readFile,
	outputFile,
	outputJson
} from 'fs-extra';

import {NAME, VERSION} from '../../../../meta';
import {OSI_ASMS_PROJECT_FILE} from '../../../../constants';
import {Command} from '../../../../command';

/**
 * ResOSIASMSDisassemble command.
 */
export default class ResOSIASMSDisassemble extends Command {
	/**
	 * Aliases.
	 */
	public static readonly aliases = [
		'res:osi:asm:sd'
	];

	/**
	 * Description.
	 */
	public static readonly description =
		'disassemble an osi file, structured assembly';

	/**
	 * Examples.
	 */
	public static readonly examples = [];

	/**
	 * Flags.
	 */
	public static readonly flags = {
		help: flags.help({char: 'h'}),
		project: flags.boolean({
			char: 'p',
			description: 'generate a project folder at destination'
		}),
		ext: flags.string({
			char: 'e',
			default: '.osas',
			description: 'project sources file extensions'
		}),
		'no-transform-class-extends': flags.boolean({
			description: 'no transform class extends (duplicates code)'
		}),
		'no-transform-class-symbols': flags.boolean({
			description: 'no transform class symbols inline'
		}),
		'no-transform-string': flags.boolean({
			description: 'no transform string inline'
		}),
		'no-transform-symbol': flags.boolean({
			description: 'no transform symbol inline'
		}),
		'no-transform-global': flags.boolean({
			description: 'no transform global inline'
		}),
		'no-transform-class': flags.boolean({
			description: 'no transform class inline'
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
	public static readonly args = [
		{
			name: 'osi',
			required: true,
			description: 'osi file to disassemble'
		},
		{
			name: 'asm',
			required: true,
			description: 'assembly output'
		}
	];

	/**
	 * Project filename.
	 */
	public static readonly projectFilename: string = OSI_ASMS_PROJECT_FILE;

	/**
	 * Project filename.
	 */
	public get projectFilename() {
		const Constructor = (this.constructor as typeof ResOSIASMSDisassemble);
		return Constructor.projectFilename;
	}

	/**
	 * Handler.
	 */
	public async run() {
		// tslint:disable-next-line: no-unused
		const {args, flags} = this.parse(ResOSIASMSDisassemble);

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
		if (!flags['no-transform-global']) {
			osi.transformAbstractGlobalAdd();
		}
		if (!flags['no-transform-class']) {
			osi.transformAbstractClassAdd();
		}

		// Skip the extends transform, duplicates any inherited code.
		if (!flags['no-transform-class-extends']) {
			osi.transformClassExtendsAdd();
		}

		// Disassemble OSI data to an AST.
		const disassembler = new AssemblyDisassemblerStructured();
		if (flags['no-transform-class-symbols']) {
			disassembler.disableTransformSymbols = true;
		}

		const banner = [
			'Format: Structured Assembly',
			`Generator: ${NAME}: ${VERSION}`,
			`SHA256: ${sha256}`
		];

		const out = args.asm;
		if (flags.project) {
			const ext = flags.ext || '';
			await this._generateProject(osi, disassembler, banner, out, ext);
		}
		else {
			await this._generateFile(osi, disassembler, banner, out);
		}
	}

	/**
	 * Generate file.
	 *
	 * @param osi OSI instance.
	 * @param disassembler Disassembler instance.
	 * @param banner Banner comment.
	 * @param filepath Output filepath.
	 */
	protected async _generateFile(
		osi: OSI,
		disassembler: AssemblyDisassemblerStructured,
		banner: string[],
		filepath: string
	) {
		const subRefs: MapSubroutineReferenceCount[] = [];
		const file = disassembler.disassemble(osi, subRefs);
		this._reportMapSubroutineReferenceCount(osi, subRefs[0]);

		// Add banner comments to the AST.
		if (banner.length) {
			file.statements.entries.unshift(...[...banner, ''].map(str => {
				const line = new ASTNodeStatementLine();
				line.comment.text = str.length ? `; ${str}` : '';
				return line;
			}));
		}

		// Encode AST to ASM.
		const encoder = new ParserEncoder();
		const asm = encoder.encode(file);

		// Write ASM to file.
		await outputFile(filepath, asm, {
			encoding: 'utf8'
		});
	}

	/**
	 * Generate project.
	 *
	 * @param osi OSI instance.
	 * @param disassembler Disassembler instance.
	 * @param banner Banner comment.
	 * @param dirpath Output directory.
	 * @param ext File extension.
	 */
	protected async _generateProject(
		osi: OSI,
		disassembler: AssemblyDisassemblerStructured,
		banner: string[],
		dirpath: string,
		ext: string
	) {
		const subRefs: MapSubroutineReferenceCount[] = [];
		const files = disassembler.disassembles(
			osi,
			this._createFileMapper(ext),
			subRefs
		);
		this._reportMapSubroutineReferenceCount(osi, subRefs[0]);

		const sources: string[] = [];
		const encoder = new ParserEncoder();
		for (const file of files) {
			const filename = file.source.file.name;
			sources.push(filename);

			const asm = encoder.encode(file);
			encoder.reset();

			const filepath = pathJoin(dirpath, filename);
			await outputFile(filepath, asm, {
				encoding: 'utf8'
			});
		}

		// Create project info file.
		const projectInfo = {
			metadata: {
				banner
			},
			sources
		};
		const projectFile = pathJoin(dirpath, this.projectFilename);
		outputJson(projectFile, projectInfo, {
			spaces: '\t',
			encoding: 'utf8'
		});
	}

	/**
	 * Create file mapper instance.
	 *
	 * @param ext File extension.
	 * @return Mapper instance.
	 */
	protected _createFileMapper(ext: string):
	IDisassemblyStructuredFileMapper {
		const dirOrFile = (name: string, dir: string, file: string) => {
			if (!name) {
				return utilFilenameEncode(`${file}${ext}`);
			}
			const fn = utilFilenameEncode(`${name}${ext}`);
			return `${dir}/${fn}`;
		};
		return {
			metadata: osi => utilFilenameEncode(`metadata${ext}`),
			strings: osi => utilFilenameEncode(`strings${ext}`),
			globals: osi => utilFilenameEncode(`globals${ext}`),
			symbols: osi => utilFilenameEncode(`symbols${ext}`),
			sources: osi => utilFilenameEncode(`sources${ext}`),
			function: (osi, def, index) =>
				dirOrFile(def.name.value, 'function', 'functions'),
			class: (osi, def, index) =>
				dirOrFile(def.name.value, 'class', 'classes'),
			subroutine: (osi, def) => utilFilenameEncode(`subroutines${ext}`)
		};
	}

	/**
	 * Report any issues from MapSubroutineReferenceCount map.
	 *
	 * @param osi OSI instance.
	 * @param map MapSubroutineReferenceCount instance.
	 */
	protected _reportMapSubroutineReferenceCount(
		osi: OSI,
		map: MapSubroutineReferenceCount
	) {
		for (const [subroutine, refc] of map) {
			// Ignore those with expected 1 reference.
			if (refc === 1) {
				continue;
			}

			// Generate warning.
			const entry = osi.subroutines.getBySubroutine(subroutine);
			const offset = entry ? entry.offset.stringEncode(16) : '<unknown>';
			const info = refc ? 'code duplication' : 'orphaned code';
			const warning =
				`Subroutine at ${offset} has ${refc} references: ${info}`;
			this.warn(warning);
		}
	}
}
