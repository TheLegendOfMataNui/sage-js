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
	const {error} = spawnSync(cmd, args, {
		cwd: pkg,
		stdio: 'inherit'
	});

	if (error) {
		throw error;
	}
}

function main() {
	const pkgs = pkg.workspaces.packages;

	for (const script of ['clean', 'prepack']) {
		for (const pkg of pkgs) {
			banner(script, pkg);
			pkgrun(pkg, 'yarn', [script]);
		}
	}
}
main();
