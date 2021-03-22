import nodeRequireFunction from 'node-require-function';

const nodeRequire = nodeRequireFunction();

const nodeUtil = nodeRequire ? nodeRequire('util') : null;

/**
 * Node util custom inspect property symbol or null.
 */
export const nodeUtilInspectSymbol =
	(nodeUtil && nodeUtil.inspect && nodeUtil.inspect.custom) ?
		nodeUtil.inspect.custom as symbol : null;

/**
 * Node util custom inspect property string (deprecated since Node 10).
 */
export const nodeUtilInspectProperty = 'inspect';
