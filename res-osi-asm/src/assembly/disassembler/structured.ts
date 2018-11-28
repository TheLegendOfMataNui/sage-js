import {
	OSI,
	FunctionDefinition,
	ClassDefinitionMethod,
	IClassDefinitionTableEntry,
	ISubroutineTableEntry,
	Subroutine
} from '@sage-js/res-osi';
import {
	IDisassemblyStructuredFileMapper,
	MapClassStructuresToNames,
	MapSourceRange,
	MapSubroutineReferenceCount
} from '../../types';
import {ExceptionInvalid} from '../../exception/invalid';
import {ASTNodeStatement} from '../../ast/node/statement/class';
import {ASTNodeStatementLine} from '../../ast/node/statement/line';
import {ASTNodeFile} from '../../ast/node/file';
import {SourceFile} from '../../sourcefile';
import {AssemblyDisassembler} from './class';

/**
 * AssemblyDisassemblerStructured constructor.
 */
export class AssemblyDisassemblerStructured extends AssemblyDisassembler {
	constructor() {
		super();
	}

	/**
	 * Disassemble OSI to AST.
	 *
	 * @param osi OSI instance.
	 * @param subroutineReferenceCount Map subroutine references count.
	 * @return AST file.
	 */
	public disassemble(
		osi: OSI,
		subroutineReferenceCount: MapSubroutineReferenceCount[] | null = null
	) {
		return this.disassembles(osi, null, subroutineReferenceCount)[0];
	}

	/**
	 * Disassemble OSI to AST.
	 * Supply a mapper object to disassemble multiple different AST files.
	 * Otherwise a single AST file is returned in the list.
	 *
	 * @param osi OSI instance.
	 * @param mapper Mapper object or null.
	 * @param subroutineReferenceCount Map subroutine references count.
	 * @return AST file.
	 */
	public disassembles(
		osi: OSI,
		mapper: IDisassemblyStructuredFileMapper | null = null,
		subroutineReferenceCount: MapSubroutineReferenceCount[] | null = null
	) {
		// File mapper.
		mapper = mapper || this._disassemblesStructuredFileMapperDefault();

		// File generator.
		const generator = this._disassemblesStructuredFileMapperGenerator();

		// Add section to file.
		const add = (file: ASTNodeFile, args: ASTNodeStatement[]) => {
			const entries = file.statements.entries;
			if (entries.length) {
				entries.push(new ASTNodeStatementLine());
			}
			entries.push(...args);
		};

		// Subroutine reference counter code.
		const subRefs = new Map() as MapSubroutineReferenceCount;
		for (const entry of osi.subroutines.itter()) {
			subRefs.set(entry.subroutine, 0);
		}
		const subRefsGet = (sub: Subroutine) => subRefs.get(sub) || 0;
		const subRefsAdd = (sub: Subroutine) => {
			subRefs.set(sub, subRefsGet(sub) + 1);
		};

		// Map out parents, that may not have been transformed yet.
		const parents = osi.mapClassParents();

		// Disassemble metadata and the different string tables.
		add(
			generator.file(mapper.metadata(osi)),
			this.disassembleMetadata(osi)
		);
		add(
			generator.file(mapper.strings(osi)),
			this.disassembleStrings(osi)
		);
		add(
			generator.file(mapper.globals(osi)),
			this.disassembleGlobals(osi)
		);
		add(
			generator.file(mapper.symbols(osi)),
			this.disassembleSymbols(osi)
		);
		add(
			generator.file(mapper.sources(osi)),
			this.disassembleSources(osi)
		);

		// Disassemble function.
		const funcs = osi.header.functionTable.entries;
		for (let i = 0; i < funcs.length; i++) {
			const definition = funcs[i];
			const subroutinePtr: Subroutine[] = [];
			add(
				generator.file(mapper.function(osi, definition, i)),
				this.disassembleStructuredFunction(
					osi,
					definition,
					i,
					subroutinePtr
				)
			);
			const subroutine = subroutinePtr[0];
			subRefsAdd(subroutine);
		}

		// Disassemble classes.
		const mapClassStructuresToNames =
			this._disassembleMapClassStructuresToNames(osi);
		const classes = osi.header.classTable.entries;
		for (let i = 0; i < classes.length; i++) {
			const definition = classes[i];
			const parent = parents.get(definition) || null;
			const subroutinesPtr: Subroutine[][] = [];
			add(
				generator.file(mapper.class(osi, definition, i)),
				this.disassembleStructuredClass(
					osi,
					definition,
					i,
					mapClassStructuresToNames,
					parent,
					subroutinesPtr
				)
			);
			for (const subroutine of subroutinesPtr[0]) {
				subRefsAdd(subroutine);
			}
		}

		// Disassemble any unreferenced subroutines.
		for (const entry of osi.subroutines.itter()) {
			const {subroutine} = entry;
			const refs = subRefsGet(subroutine);

			// Skip those that are already referenced.
			if (refs) {
				continue;
			}

			// Disassemble any unreferenced subroutines.
			add(
				generator.file(mapper.subroutine(osi, entry)),
				this.disassembleStructuredSubroutine(osi, entry)
			);
		}

		// Pass out the subroutine references map, if requested.
		if (subroutineReferenceCount) {
			subroutineReferenceCount[0] = subRefs;
		}

		// Assemble all the generated files into a list.
		return generator.list();
	}

	/**
	 * Encode OSI AST function.
	 *
	 * @param osi OSI instance.
	 * @param functionDefinition Function definition.
	 * @param index Table index.
	 * @param subroutine Consumed subroutine pointer out.
	 * @return AST statements.
	 */
	public disassembleStructuredFunction(
		osi: OSI,
		functionDefinition: FunctionDefinition,
		index: number,
		subroutine: Subroutine[] | null = null
	): ASTNodeStatement[] {
		const offset = functionDefinition.offset;
		const ast = this._disassembleCreateStatementBlock('function');
		this._disassembleSetComment(ast.begin.comment, `${index}`);

		const argEntries = ast.begin.arguments.entries;
		argEntries.push(
			this._disassembleCreateArgumentFromString(functionDefinition.name)
		);

		argEntries.push(
			this._disassembleCreateArgumentFromInt(functionDefinition.argc)
		);

		const sub = osi.subroutines.getByOffset(offset);
		if (!sub) {
			throw new ExceptionInvalid(
				`No subroutine at offset: ${offset.stringEncode(16)}`
			);
		}

		ast.statements.entries.push(
			...this.disassembleStructuredSubroutineBody(osi, sub)
		);

		if (subroutine) {
			subroutine[0] = sub.subroutine;
		}
		return [ast];
	}

	/**
	 * Encode OSI AST class.
	 *
	 * @param osi OSI instance.
	 * @param classDefinition Class definition.
	 * @param index Table index.
	 * @param mapClassStructuresToNames Class structures to names.
	 * @param parent Parent definition or null.
	 * @param subroutines Consumed subroutines pointer out.
	 * @return AST statements.
	 */
	public disassembleStructuredClass(
		osi: OSI,
		classDefinition: IClassDefinitionTableEntry,
		index: number,
		mapClassStructuresToNames: MapClassStructuresToNames,
		parent: IClassDefinitionTableEntry | null,
		subroutines: Subroutine[][] | null = null
	): ASTNodeStatement[] {
		const {name, structure} = classDefinition;

		const comments = [`${index}`];

		const extend = structure.extends;
		const extendName = extend ?
			mapClassStructuresToNames.get(extend) || null : null;

		// If a parent was mapped out but not transformed then comment it.
		if (parent && !extend) {
			const name = parent.name.stringEncode();
			comments.push(`extends ${name}`);
		}

		const ast = this._disassembleCreateStatementBlock('class');
		this._disassembleSetComment(ast.begin.comment, comments.join(', '));

		ast.begin.arguments.entries.push(
			this._disassembleCreateArgumentFromString(name)
		);

		if (extendName) {
			ast.begin.arguments.entries.push(
				this._disassembleCreateArgumentFromString(extendName)
			);
		}

		const entries = ast.statements.entries;

		for (const property of structure.classPropertyTable.entries) {
			entries.push(...this.disassembleClassProperty(
				osi,
				property
			));
		}

		const subroutinesOut: Subroutine[] | null = subroutines ? [] : null;

		const subroutine: Subroutine[] = [];
		for (const method of structure.classMethodTable.entries) {
			// Add blank line between each block.
			if (entries.length) {
				entries.push(this._disassembleCreateStatementLine());
			}
			entries.push(...this.disassembleStructuredClassMethod(
				osi,
				method,
				subroutine
			));
			if (subroutinesOut) {
				subroutinesOut.push(subroutine[0]);
			}
		}
		if (subroutines && subroutinesOut) {
			subroutines[0] = subroutinesOut;
		}

		return [ast];
	}

	/**
	 * Encode OSI AST class property.
	 *
	 * @param osi OSI instance.
	 * @param property Class property.
	 * @param subroutine Consumed subroutine pointer out.
	 * @return AST statements.
	 */
	public disassembleStructuredClassMethod(
		osi: OSI,
		method: ClassDefinitionMethod,
		subroutine: Subroutine[] | null = null
	): ASTNodeStatement[] {
		const symbols = osi.header.symbolTable.entries;
		const offset = method.offset;
		const comments = [];

		const ast = this._disassembleCreateStatementBlock('method');

		const nameArg = this._disassembleConvertSymbolToArgumentComment(
			symbols,
			method.symbol
		);
		ast.begin.arguments.entries.push(nameArg.arg);
		if (nameArg.comment !== null) {
			comments.push(nameArg.comment);
		}

		this._disassembleSetComment(ast.begin.comment, comments.join(', '));

		const sub = osi.subroutines.getByOffset(offset);
		if (!sub) {
			throw new ExceptionInvalid(
				`No subroutine at offset: ${offset.stringEncode(16)}`
			);
		}

		ast.statements.entries.push(
			...this.disassembleStructuredSubroutineBody(osi, sub)
		);

		if (subroutine) {
			subroutine[0] = sub.subroutine;
		}
		return [ast];
	}

	/**
	 * Encode OSI AST subroutine.
	 *
	 * @param osi OSI instance.
	 * @param subroutineEntry Subroutine entry.
	 * @return AST statements.
	 */
	public disassembleStructuredSubroutine(
		osi: OSI,
		subroutineEntry: ISubroutineTableEntry
	): ASTNodeStatement[] {
		const ast = this._disassembleCreateStatementBlock('subroutine');

		ast.statements.entries.push(
			...this.disassembleStructuredSubroutineBody(osi, subroutineEntry)
		);

		return [ast];
	}

	/**
	 * Encode OSI AST subroutine body.
	 *
	 * @param osi OSI instance.
	 * @param subroutineEntry Subroutine entry.
	 * @return AST statements.
	 */
	public disassembleStructuredSubroutineBody(
		osi: OSI,
		subroutineEntry: ISubroutineTableEntry
	): ASTNodeStatement[] {
		const {offset, subroutine} = subroutineEntry;

		const r: ASTNodeStatement[] = [];

		const addressComment = this._disassembleCreateStatementLine();
		this._disassembleSetComment(
			addressComment.comment,
			`address: ${offset.stringEncode(16)}`
		);
		r.push(addressComment);

		const mapSourceRange = new Map() as MapSourceRange;

		// Loop over the instructions.
		const instructions: ASTNodeStatement[][] = [];
		for (const instruction of subroutine.instructions) {
			instructions.push(this.disassembleInstruction(
				osi,
				instruction,
				subroutineEntry,
				mapSourceRange
			));
		}

		const sourceRangeComments = this._disassembleMapSourceRangeComment(
			osi,
			mapSourceRange
		);

		r.push(...sourceRangeComments);

		for (const insts of instructions) {
			r.push(...insts);
		}

		return r;
	}

	/**
	 * Takes a mapper object and returns AST file generators.
	 *
	 * @param mapper Mapper object or null.
	 * @return Generator methods.
	 */
	protected _disassemblesStructuredFileMapperGenerator() {
		const map = new Map<string, ASTNodeFile>();
		const file = (name: string) => {
			let ast = map.get(name) || null;
			if (!ast) {
				ast = new ASTNodeFile();
				ast.source.file = new SourceFile('', name);
				map.set(name, ast);
			}
			return ast;
		};

		const list = () => [...map.values()];
		return {list, file};
	}

	/**
	 * Default file mapper instance.
	 *
	 * @return Mapper instance.
	 */
	protected _disassemblesStructuredFileMapperDefault():
	IDisassemblyStructuredFileMapper {
		return {
			metadata: osi => '',
			strings: osi => '',
			globals: osi => '',
			symbols: osi => '',
			sources: osi => '',
			function: (osi, def, index) => '',
			class: (osi, def, index) => '',
			subroutine: (osi, def) => ''
		};
	}
}
