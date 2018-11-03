// tslint:disable: max-classes-per-file

import {decoratorProperty} from './decorators';
import {NAME} from './meta';

/**
 * Typed constructor.
 *
 * @param prefix Prefix string.
 * @param namespace Namespace string.
 * @param parent Parent for making namespace.
 */
export class Typed extends Object {
	/**
	 * Exception unique to prefix, but shared by namespaces.
	 */
	public readonly Exception: new(message: string) => Error;

	/**
	 * Prefix string.
	 */
	@decoratorProperty(false)
	protected readonly _prefix: string;

	/**
	 * Property key.
	 */
	@decoratorProperty(false)
	protected readonly _property: string;

	/**
	 * Current namespace.
	 */
	@decoratorProperty(false)
	protected readonly _namespace: string;

	/**
	 * Current namespace safely encoded.
	 */
	@decoratorProperty(false)
	protected readonly _namespaceEncoded: string;

	constructor(
		prefix: string,
		namespace: string,
		parent: Typed | null = null
	) {
		super();

		this._prefix = prefix;
		this._namespace = namespace;
		this._property = '__#TYPED#' + prefix;
		this._namespaceEncoded = this._encode(namespace);

		let Exception = parent ? parent.Exception : null;
		if (!Exception) {
			/**
			 * Typed exception.
			 *
			 * @param message Exception message.
			 */
			@this.decorateException('TypedException')
			class TypedException extends Error {
				constructor(message: string) {
					super(message);
				}
			}
			Exception = TypedException;
		}
		this.Exception = Exception;
	}

	/**
	 * Create a new namespace.
	 *
	 * @param namespace Namespace string.
	 * @return Namespaced instance.
	 */
	public namespace(namespace: string) {
		return new Typed(this._prefix, namespace, this);
	}

	/**
	 * Decorate a class constructor.
	 *
	 * @param type A type string unique to each namespaced instance.
	 * @return Decorator function.
	 */
	public decorate(type: string) {
		// tslint:disable-next-line: ban-types
		return (Class: Function) => {
			this._addClassType(type, Class);
		};
	}

	/**
	 * Decorate exception class constructor.
	 *
	 * @param type A type string unique to each namespaced instance.
	 * @return Decorator function.
	 */
	public decorateException(type: string) {
		// tslint:disable-next-line: ban-types
		return (Class: Function) => {
			Object.defineProperty(Class.prototype, 'name', {
				value: type,
				writable: true,
				enumerable: true,
				configurable: true
			});
			this._addClassType(type, Class);
		};
	}

	/**
	 * Cast an object to a type, returns null on failure.
	 *
	 * @param instance Object instance.
	 * @param Class Class constructor.
	 * @return Class instance or null.
	 */
	public cast<
		// tslint:disable-next-line: ban-types
		C extends Function
	>(
		// tslint:disable-next-line: ban-types
		instance: Object,
		Class: C
	): C['prototype'] | null {
		const classTypeID = this._getClassTypeID(Class);
		if (!classTypeID) {
			throw new this.Exception('Cannot cast to an untyped type');
		}
		const typeID = this._getTypeID(instance);
		if (typeID) {
			// Check if same prefix.
			const l = classTypeID.length;
			const pre = typeID.substr(0, l);
			if (pre === classTypeID) {
				// Check if exact match or delimited.
				const del = typeID.charAt(l);
				if (!del || del === '?' || del === '#') {
					return instance;
				}
			}
		}
		return null;
	}

	/**
	 * Cast an object to a type, throw error on failure.
	 *
	 * @param instance Object instance.
	 * @param Class Class constructor.
	 * @return Class instance or null.
	 */
	public tryCast<
		// tslint:disable-next-line: ban-types
		C extends Function
	>(
		// tslint:disable-next-line: ban-types
		instance: Object,
		Class: C
	): C['prototype'] {
		const cast = this.cast(instance, Class);
		if (!cast) {
			throw new this.Exception('Cannot cast to type');
		}
		return cast;
	}

	/**
	 * Add class type info.
	 *
	 * @param type Type string.
	 * @param Class Class constructor.
	 */
	protected _addClassType(
		type: string,
		// tslint:disable-next-line: ban-types
		Class: Function
	) {
		const parentTypeID = this._getClassParentTypeID(Class) || '';
		const ns = `#${this._namespaceEncoded}`;

		// Construct the type ID, adding namespace if not already added.
		let typeID = parentTypeID;
		if (parentTypeID.indexOf(`${ns}?`) < 0) {
			typeID += ns;
		}
		typeID += `?${this._encode(type)}`;

		Object.defineProperty(Class, this._property, {
			value: typeID,
			writable: false,
			configurable: false,
			enumerable: false
		});
	}

	/**
	 * Get namespaced type ID from a type string.
	 *
	 * @param instance Object instance.
	 * @return Type ID.
	 */
	protected _getTypeID(
		// tslint:disable-next-line: ban-types
		instance: Object
	) {
		const Class = instance.constructor;
		return Class ? this._getClassTypeID(Class) : null;
	}

	/**
	 * Get type ID from class constructor.
	 *
	 * @param instance Class constructor.
	 * @return Type ID or null.
	 */
	protected _getClassTypeID(
		// tslint:disable-next-line: ban-types
		Class: Function
	) {
		return (Class as any)[this._property] as string || null;
	}

	/**
	 * Get type ID from parent of class constructor.
	 *
	 * @param instance Class constructor.
	 * @return Type ID or null.
	 */
	protected _getClassParentTypeID(
		// tslint:disable-next-line: ban-types
		Class: Function
	) {
		const parent = Object.getPrototypeOf(Class);
		return parent ? this._getClassTypeID(parent) : null;
	}

	/**
	 * Encode string.
	 *
	 * @param str String to be encoded.
	 * @return Encoded string.
	 */
	protected _encode(str: string) {
		return str.replace(/([\\#?])/g, '\\$1');
	}
}

export const typed = new Typed(NAME, NAME);
