import {
	MapClassDefinitionExtends,
	MapClassDefinitionTableEntryExtends
} from './types';

/**
 * Converts the map from OSI mapClassParents for transformClassExtendsAdd.
 *
 * @param from Map to convert from.
 * @returns Converted map.
 */
export function utilMapClassDefinitionEntriesToExtends(
	from: MapClassDefinitionTableEntryExtends
) {
	const r = new Map() as MapClassDefinitionExtends;
	for (const [k, v] of from) {
		r.set(k.structure, v ? v.structure : null);
	}
	return r;
}
