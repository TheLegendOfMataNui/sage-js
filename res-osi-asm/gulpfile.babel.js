import fs from 'fs';
import path from 'path';
import util from 'util';

import gulp from 'gulp';
import gulpRename from 'gulp-rename';
import gulpInsert from 'gulp-insert';
import gulpFilter from 'gulp-filter';
import gulpReplace from 'gulp-replace';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpBabel from 'gulp-babel';
import pump from 'pump';

const pumpP = util.promisify(pump);
const fsReadFileP = util.promisify(fs.readFile);

async function packageJSON() {
	packageJSON.json = packageJSON.json || fsReadFileP('package.json', 'utf8');
	return JSON.parse(await packageJSON.json);
}

async function babelrc() {
	babelrc.json = babelrc.json || fsReadFileP('.babelrc', 'utf8');
	const r = JSON.parse(await babelrc.json);

	// Prevent .babelrc file from being loaded again by the plugin.
	r.babelrc = false;
	return r;
}

async function babelTarget(src, srcOpts, dest, modules) {
	// Change module.
	const babelOptions = await babelrc();
	for (const preset of babelOptions.presets) {
		if (preset[0] === '@babel/preset-env') {
			preset[1].modules = modules;
		}
	}
	if (!modules) {
		babelOptions.plugins.push([
			'esm-resolver', {
				source: {
					extensions: [
						[
							['.js', '.mjs', '.jsx', '.mjsx', '.ts', '.tsx'],
							'.mjs'
						]
					]
				}
			}
		]);
	}

	// Read the package JSON.
	const pkg = await packageJSON();

	// Filter meta data file and create replace transform.
	const filterMeta = gulpFilter(['*/meta.ts'], {restore: true});
	const filterMetaReplaces = [
		["'@VERSION@'", JSON.stringify(pkg.version)],
		["'@NAME@'", JSON.stringify(pkg.name)]
	].map(v => gulpReplace(...v));

	const filterAntlr = gulpFilter([
		'*/antlr/*Lexer.ts',
		'*/antlr/*Listener.ts',
		'*/antlr/*Parser.ts'
	], {restore: true});
	const filterAntlrReplaces = [
		// ['@Override', '/*@Override*/'],
		// ['@NotNull', '/*@NotNull*/'],
		// ['@RuleVersion(0)', '/*@RuleVersion(0)*/'],
		...[
			'antlr4ts/CharStream',
			'antlr4ts/Decorators',
			'antlr4ts/FailedPredicateException',
			'antlr4ts/Lexer',
			'antlr4ts/NoViableAltException',
			'antlr4ts/Parser',
			'antlr4ts/ParserRuleContext',
			'antlr4ts/RecognitionException',
			'antlr4ts/RuleContext',
			'antlr4ts/RuleVersion',
			'antlr4ts/Token',
			'antlr4ts/TokenStream',
			'antlr4ts/Vocabulary',
			'antlr4ts/VocabularyImpl',
			'antlr4ts/atn/ATN',
			'antlr4ts/atn/ATNDeserializer',
			'antlr4ts/atn/LexerATNSimulator',
			'antlr4ts/atn/ParserATNSimulator',
			'antlr4ts/misc/Utils',
			'antlr4ts/tree/ParseTreeListener',
			'antlr4ts/tree/ParseTreeVisitor',
			'antlr4ts/tree/TerminalNode'
		].map(s => [`"${s}"`, `"${s}.js"`])
	].map(v => gulpReplace(...v));

	await pumpP(...[
		gulp.src(src, srcOpts),
		filterMeta,
		...filterMetaReplaces,
		filterMeta.restore,
		filterAntlr,
		...filterAntlrReplaces,
		filterAntlr.restore,
		gulpSourcemaps.init(),
		gulpBabel(babelOptions),
		gulpRename(path => {
			if (!modules && path.extname === '.js') {
				path.extname = '.mjs';
			}
		}),
		gulpSourcemaps.write('.', {
			includeContent: true,
			addComment: false,
			destPath: dest
		}),
		gulpInsert.transform((contents, file) => {
			if (/\.m?js$/i.test(file.path)) {
				const base = path.basename(file.path);
				return `${contents}\n//# sourceMappingURL=${base}.map\n`;
			}
			return contents;
		}),
		gulp.dest(dest)
	].filter(Boolean));
}

export async function buildLibCjs() {
	await babelTarget(['src/**/*.ts'], {}, 'lib', 'commonjs');
}

export async function buildLibMjs() {
	await babelTarget(['src/**/*.ts'], {}, 'lib', false);
}
