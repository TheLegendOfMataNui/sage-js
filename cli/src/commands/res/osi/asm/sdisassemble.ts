import {createHash} from 'crypto';
import {join as pathJoin} from 'path';

import {flags} from '@oclif/command';
import {
	BufferView,
	utilFilenameEncode
} from '@sage-js/core';
import {
	OSI,
	IClassDefinitionTableEntry,
	ClassDefinition
} from '@sage-js/res-osi';
import {
	IDisassemblyStructuredFileMapper,
	AssemblyDisassemblerStructured,
	ParserEncoder,
	ASTNodeFile,
	ASTNodeStatementLine,
	MapSubroutineReferenceCount
} from '@sage-js/res-osi-asm';
import {
	readFile,
	outputFile
} from 'fs-extra';

import {NAME, VERSION} from '../../../../meta';
import {OSI_ASMS_PROJECT_SOURCE_EXT} from '../../../../constants';
import {Command} from '../../../../command';

/**
 * ResOSIASMSDisassemble command.
 */
// eslint-disable-next-line import/no-default-export
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
	public static readonly description = (
		'disassemble an osi file, structured assembly'
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
		project: flags.boolean({
			char: 'p',
			description: 'generate a project folder at destination'
		}),
		ext: flags.string({
			char: 'e',
			default: OSI_ASMS_PROJECT_SOURCE_EXT,
			description: 'project sources file extensions'
		}),
		'index-comments': flags.boolean({
			description: 'include comments for index of things'
		}),
		'no-class-nesting': flags.boolean({
			description: 'no nesting of classes in directories'
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
	 * Handler.
	 */
	public async run() {
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

		// Create disassembler.
		const disassembler = new AssemblyDisassemblerStructured();
		if (flags['no-transform-class-symbols']) {
			disassembler.disableTransformSymbols = true;
		}
		if (flags['index-comments']) {
			disassembler.enableIndexComments = true;
		}

		// Create the banner comments.
		const banner = [
			'Format: Structured Assembly',
			`Generator: ${NAME}: ${VERSION}`,
			`SHA256: ${sha256}`
		];

		// Disassemble OSI data to an AST, either single file or a project.
		const out = args.asm;
		if (!flags.project) {
			await this._generateFile(osi, disassembler, banner, out);
			return;
		}

		const ext = flags.ext || OSI_ASMS_PROJECT_SOURCE_EXT;
		const nesting = !flags['no-class-nesting'];
		await this._generateProject(
			osi, disassembler, banner, out, ext, nesting
		);
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
		this._addBannerComments(file, banner);

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
	 * @param ext File extension, must not be empty.
	 * @param nesting Nest classes in directories.
	 */
	protected async _generateProject(
		osi: OSI,
		disassembler: AssemblyDisassemblerStructured,
		banner: string[],
		dirpath: string,
		ext: string,
		nesting: boolean
	) {
		const subRefs: MapSubroutineReferenceCount[] = [];
		const fileMapper = this._createFileMapper(osi, ext, nesting);
		const metadataFilename = fileMapper.metadata(osi);
		const files = disassembler.disassembles(osi, fileMapper, subRefs);
		this._reportMapSubroutineReferenceCount(osi, subRefs[0]);

		// Encode all the files and assemble a list of all the sources.
		const encoder = new ParserEncoder();
		for (const file of files) {
			const filename = file.source.file.name;

			// Add banner comment to metadata file.
			if (filename === metadataFilename) {
				this._addBannerComments(file, banner);
			}

			const asm = encoder.encode(file);
			encoder.reset();

			const filepath = pathJoin(dirpath, filename);
			// eslint-disable-next-line no-await-in-loop
			await outputFile(filepath, asm, {
				encoding: 'utf8'
			});
		}
	}

	/**
	 * Create file mapper instance.
	 *
	 * @param osi OSI instance.
	 * @param ext File extension, must not be empty.
	 * @param nesting Nest classes in directories.
	 * @returns Mapper instance.
	 */
	protected _createFileMapper(osi: OSI, ext: string, nesting: boolean):
	IDisassemblyStructuredFileMapper {
		const classNameByStructure = new Map<ClassDefinition, string>();
		if (nesting) {
			for (const {name, structure} of osi.header.classTable.entries) {
				classNameByStructure.set(structure, name.value);
			}
		}

		const classParentNames = (def: ClassDefinition) => {
			const r = [];
			let extend = def.extends;
			for (; extend; extend = extend.extends) {
				const name = classNameByStructure.get(extend) || '';
				r.push(name);
			}
			return r;
		};

		const dirOrFile = (name: string, dirs: string[], file: string) => {
			if (!name) {
				return `${utilFilenameEncode(file)}${ext}`;
			}
			const fn = `${utilFilenameEncode(name)}${ext}`;
			const dirp: string[] = [];
			for (const d of dirs) {
				if (!d || d.startsWith('.')) {
					return `${utilFilenameEncode(file)}${ext}`;
				}
				dirp.push(utilFilenameEncode(d));
			}
			return `${dirp.join('/')}/${fn}`;
		};

		const dirOrFileClass = (
			osi: OSI,
			def: IClassDefinitionTableEntry,
			dirs: string[],
			file: string
		) => {
			const name = def.name.value;
			if (!nesting) {
				return dirOrFile(name, dirs, file);
			}
			const parents = classParentNames(def.structure).reverse();
			if (!parents.length) {
				return dirOrFile(name, dirs, file);
			}

			const dirsNested = [...dirs, ...parents];
			return dirOrFile(name, dirsNested, file);
		};

		return {
			metadata: osi => `metadata${ext}`,
			strings: osi => `strings${ext}`,
			globals: osi => `globals${ext}`,
			symbols: osi => `symbols${ext}`,
			sources: osi => `sources${ext}`,
			function: (osi, def, index) =>
				dirOrFile(def.name.value, ['function'], 'functions'),
			class: (osi, def, index) =>
				dirOrFileClass(osi, def, ['class'], 'classes'),
			subroutine: (osi, def) => `subroutines${ext}`
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

	/**
	 * Add banner comment to file AST.
	 *
	 * @param file AST file.
	 * @param banner Banner comments.
	 */
	protected _addBannerComments(file: ASTNodeFile, banner: string[]) {
		// Add banner comments to the AST.
		if (!banner.length) {
			return;
		}
		file.statements.entries.unshift(...[...banner, ''].map(str => {
			const line = new ASTNodeStatementLine();
			line.comment.text = str.length ? `; ${str}` : '';
			return line;
		}));
	}
}
