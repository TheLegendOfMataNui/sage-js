/* eslint no-console: 0 */
/* eslint no-sync: 0 */

'use strict';

const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

function pkgver(pkg, version, deps) {
	console.log('Updating:', pkg);
	const verEnc = JSON.stringify(version).replace(/(^"|"$)/g, '');

	const fp = path.join(pkg, 'package.json');
	let json = fs.readFileSync(fp, 'utf8');

	// Replace version without changing anything, even the whitespace.
	json = json.replace(
		/("version":\s*").*(")/, (m, p1, p2) => p1 + verEnc + p2
	);

	// Do the same for the dependencies.
	json = json.replace(
		/(")(.*)(":\s*"[~^]?)(.*)(")/g, (m, p1, p2, p3, p4, p5) => {
			if (!deps.has(p2)) {
				return m;
			}
			return p1 + p2 + p3 + verEnc + p5;
		}
	);

	// Verify success.
	const newver = JSON.parse(json).version;
	if (newver !== version) {
		throw new Error('Failed to replace version');
	}

	// Write the updated file.
	fs.writeFileSync(fp, json);
}

function pkgname(pkg) {
	console.log('Reading:', pkg);

	const fp = path.join(pkg, 'package.json');
	const json = fs.readFileSync(fp, 'utf8');
	return JSON.parse(json).name;
}

function main(argv) {
	if (argv.length !== 1) {
		throw new Error('Missing new version argument');
	}
	const [version] = argv;

	const pkgs = pkg.workspaces.packages;
	const deps = new Set(pkgs.map(s => pkgname(s)));

	for (const pkg of pkgs) {
		pkgver(pkg, version, deps);
	}
}
main(process.argv.slice(2));
