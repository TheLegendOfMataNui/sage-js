/* eslint no-console: 0 */
/* eslint no-sync: 0 */

'use strict';

const {spawnSync} = require('child_process');

const pkg = require('../package.json');

function banner(type, name) {
	console.log('');
	console.log('#'.repeat(80));
	console.log('#', type, ':', name);
	console.log('#'.repeat(80));
}

function pkgrun(pkg, cmd, args) {
	const {error, status} = spawnSync(cmd, args, {
		cwd: pkg,
		stdio: 'inherit'
	});

	if (error) {
		throw error;
	}
	return status;
}

function main() {
	const args = process.argv.slice(2);
	const lint = !(args.length && args[0] === '0');

	const pkgs = pkg.workspaces.packages;

	let exitCodes = false;
	for (const script of [
		'clean',
		'build',
		...(lint ? ['lint'] : []),
		'test'
	]) {
		for (const pkg of pkgs) {
			banner(script, pkg);
			const exitCode = pkgrun(pkg, 'yarn', [script]);
			console.log(`Exit code: ${exitCode}`);
			if (exitCode) {
				exitCodes = true;
			}
		}
	}
	if (exitCodes) {
		throw new Error('Build finished with errors');
	}
}
main();
