import {Command as CommandBase} from '@oclif/command';
import {install as sourceMapSupportInstall} from 'source-map-support';

/**
 * Command constructor.
 */
export abstract class Command extends CommandBase {
	/**
	 * Init function.
	 *
	 * @returns Init value.
	 */
	public async init() {
		if (
			/^(1|true|yes)$/i.test(
				// eslint-disable-next-line no-process-env
				process.env.SAGE_JS_DEBUG_SOURCE_MAPS || ''
			)
		) {
			sourceMapSupportInstall();
		}
		return super.init();
	}
}
