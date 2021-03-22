import {
	nodeUtilInspectSymbol,
	nodeUtilInspectProperty
} from './node';

const nodeUtilInspectProp = nodeUtilInspectSymbol || nodeUtilInspectProperty;

/**
 * Decorate property with defaults.
 *
 * @param enumerable Is enumerable.
 * @param configurable Is configurable.
 * @param writable Is writable.
 * @returns Decorator function.
 */
export function decoratorProperty(
	enumerable = true,
	configurable = true,
	writable = true
) {
	return function(
		target: any,
		key: string | symbol,
		descriptor?: PropertyDescriptor
	) {
		const d = descriptor as PropertyDescriptor;
		d.enumerable = enumerable;
		d.configurable = configurable;
		d.writable = writable;
	};
}

/**
 * Decorate method with defaults.
 *
 * @param enumerable Is enumerable.
 * @param configurable Is configurable.
 * @param writable Is writable.
 * @returns Decorator function.
 */
export function decoratorMethod(
	enumerable = false,
	configurable = true,
	writable = true
) {
	return function(
		target: any,
		key: string | symbol,
		descriptor?: PropertyDescriptor
	) {
		const d = descriptor as PropertyDescriptor;
		d.enumerable = enumerable;
		d.configurable = configurable;
		d.writable = writable;
	};
}

/**
 * Decorate enumerable.
 *
 * @param enumerable Is enumerable.
 * @returns Decorator function.
 */
export function decoratorEnumerable(enumerable: boolean) {
	return function(
		target: any,
		key: string | symbol,
		descriptor?: PropertyDescriptor
	) {
		const d = descriptor as PropertyDescriptor;
		d.enumerable = enumerable;
	};
}

/**
 * Decorate configurable.
 *
 * @param configurable Is configurable.
 * @returns Decorator function.
 */
export function decoratorConfigurable(configurable: boolean) {
	return function(
		target: any,
		key: string | symbol,
		descriptor?: PropertyDescriptor
	) {
		const d = descriptor as PropertyDescriptor;
		d.configurable = configurable;
	};
}

/**
 * Decorate writable.
 *
 * @param writable Is writable.
 * @returns Decorator function.
 */
export function decoratorWritable(writable: boolean) {
	return function(
		target: any,
		key: string | symbol,
		descriptor?: PropertyDescriptor
	) {
		const d = descriptor as PropertyDescriptor;
		d.writable = writable;
	};
}

/**
 * Decorate node inspect property.
 *
 * @returns Decorator function.
 */
export function decoratorInspect() {
	return function(
		target: any,
		key: string | symbol,
		descriptor?: PropertyDescriptor
	) {
		if (!descriptor || key === nodeUtilInspectProp) {
			return;
		}
		Object.defineProperty(target, nodeUtilInspectProp, descriptor);
	};
}
