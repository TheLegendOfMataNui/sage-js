import {flags} from '@oclif/command';
import {
	NAME as CORE_NAME,
	VERSION as CORE_VERSION
} from '@sage-js/core';
import {
	NAME as RES_OSI_NAME,
	VERSION as RES_OSI_VERSION
} from '@sage-js/res-osi';
import {
	NAME as RES_OSI_ASM_NAME,
	VERSION as RES_OSI_ASM_VERSION
} from '@sage-js/res-osi-asm';
import {
	NAME,
	VERSION
} from '../meta';
import {Command} from '../command';

/**
 * ResOSIASMDisassemble command.
 */
export default class Info extends Command {

	/**
	 * Description.
	 */
	public static description = 'display info about program';

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
	public static args = [];

	/**
	 * Handler.
	 */
	public async run() {
		// tslint:disable-next-line: no-unused
		const {args, flags} = this.parse(Info);

		this.log('Version:');
		this.log(`  ${NAME}: ${VERSION}`);

		this.log('');

		this.log('Library versions:');
		for (const info of [
			[CORE_NAME, CORE_VERSION],
			[RES_OSI_NAME, RES_OSI_VERSION],
			[RES_OSI_ASM_NAME, RES_OSI_ASM_VERSION]
		]) {
			this.log(`  ${info[0]}: ${info[1]}`);
		}

		this.log('');
	}
}
