import {
	typed
} from './typed';

describe('typed', () => {
	describe('Cast', () => {
		/**
		 * Something class.
		 */
		@typed.decorate('Something')
		class Something extends Object {
			constructor() {
				super();
			}
		}

		/**
		 * SomethingAlpha class.
		 */
		@typed.decorate('SomethingAlpha')
		class SomethingAlpha extends Something {
			constructor() {
				super();
			}
		}

		/**
		 * SomethingBeta class.
		 */
		@typed.decorate('SomethingBeta')
		class SomethingBeta extends Something {
			constructor() {
				super();
			}
		}

		const something = new Something();
		const somethingAlpha: Something = new SomethingAlpha();
		const somethingBeta: Something = new SomethingBeta();

		it('Cast to Something', () => {
			expect(typed.cast(something, Something))
				.toBe(something);
			expect(typed.cast(somethingAlpha, Something))
				.toBe(somethingAlpha);
			expect(typed.cast(somethingBeta, Something))
				.toBe(somethingBeta);
			expect(typed.cast({}, Something))
				.toBe(null);
		});

		it('Cast to SomethingAlpha', () => {
			expect(typed.cast(something, SomethingAlpha))
				.toBe(null);
			expect(typed.cast(somethingAlpha, SomethingAlpha))
				.toBe(somethingAlpha);
			expect(typed.cast(somethingBeta, SomethingAlpha))
				.toBe(null);
			expect(typed.cast({}, SomethingAlpha))
				.toBe(null);
		});

		it('Cast to SomethingBeta', () => {
			expect(typed.cast(something, SomethingBeta))
				.toBe(null);
			expect(typed.cast(somethingAlpha, SomethingBeta))
				.toBe(null);
			expect(typed.cast(somethingBeta, SomethingBeta))
				.toBe(somethingBeta);
			expect(typed.cast({}, SomethingBeta))
				.toBe(null);
		});
	});

	describe('Cast Namespaced', () => {
		const typedNS = typed.namespace('@some/package');

		/**
		 * Something class.
		 */
		@typed.decorate('Something')
		class Something extends Object {
			constructor() {
				super();
			}
		}

		/**
		 * SomethingAlpha class.
		 */
		@typedNS.decorate('SomethingAlpha')
		class SomethingAlpha extends Something {
			constructor() {
				super();
			}
		}

		/**
		 * SomethingBeta class.
		 */
		@typedNS.decorate('SomethingBeta')
		class SomethingBeta extends Something {
			constructor() {
				super();
			}
		}

		const something = new Something();
		const somethingAlpha: Something = new SomethingAlpha();
		const somethingBeta: Something = new SomethingBeta();

		it('Cast to Something', () => {
			expect(typed.cast(something, Something))
				.toBe(something);
			expect(typed.cast(somethingAlpha, Something))
				.toBe(somethingAlpha);
			expect(typed.cast(somethingBeta, Something))
				.toBe(somethingBeta);
			expect(typed.cast({}, Something))
				.toBe(null);

			expect(typedNS.cast(something, Something))
				.toBe(something);
			expect(typedNS.cast(somethingAlpha, Something))
				.toBe(somethingAlpha);
			expect(typedNS.cast(somethingBeta, Something))
				.toBe(somethingBeta);
			expect(typedNS.cast({}, Something))
				.toBe(null);
		});

		it('Cast to SomethingAlpha', () => {
			expect(typed.cast(something, SomethingAlpha))
				.toBe(null);
			expect(typed.cast(somethingAlpha, SomethingAlpha))
				.toBe(somethingAlpha);
			expect(typed.cast(somethingBeta, SomethingAlpha))
				.toBe(null);
			expect(typed.cast({}, SomethingAlpha))
				.toBe(null);

			expect(typedNS.cast(something, SomethingAlpha))
				.toBe(null);
			expect(typedNS.cast(somethingAlpha, SomethingAlpha))
				.toBe(somethingAlpha);
			expect(typedNS.cast(somethingBeta, SomethingAlpha))
				.toBe(null);
			expect(typedNS.cast({}, SomethingAlpha))
				.toBe(null);
		});

		it('Cast to SomethingBeta', () => {
			expect(typed.cast(something, SomethingBeta))
				.toBe(null);
			expect(typed.cast(somethingAlpha, SomethingBeta))
				.toBe(null);
			expect(typed.cast(somethingBeta, SomethingBeta))
				.toBe(somethingBeta);
			expect(typed.cast({}, SomethingBeta))
				.toBe(null);

			expect(typedNS.cast(something, SomethingBeta))
				.toBe(null);
			expect(typedNS.cast(somethingAlpha, SomethingBeta))
				.toBe(null);
			expect(typedNS.cast(somethingBeta, SomethingBeta))
				.toBe(somethingBeta);
			expect(typedNS.cast({}, SomethingBeta))
				.toBe(null);
		});
	});

	describe('Cast Abstract', () => {
		/**
		 * Something class.
		 */
		abstract class Something extends Object {
			constructor() {
				super();
			}
		}
		// TODO: Replace with proper decorators once the Babel bug is fixed.
		typed.decorate('Something')(Something);

		/**
		 * SomethingAlpha class.
		 */
		@typed.decorate('SomethingAlpha')
		class SomethingAlpha extends Something {
			constructor() {
				super();
			}
		}

		/**
		 * SomethingBeta class.
		 */
		@typed.decorate('SomethingBeta')
		class SomethingBeta extends Something {
			constructor() {
				super();
			}
		}

		const somethingAlpha: Something = new SomethingAlpha();
		const somethingBeta: Something = new SomethingBeta();

		it('Cast to Something', () => {
			expect(typed.cast(somethingAlpha, Something))
				.toBe(somethingAlpha);
			expect(typed.cast(somethingBeta, Something))
				.toBe(somethingBeta);
			expect(typed.cast({}, Something))
				.toBe(null);
		});

		it('Cast to SomethingAlpha', () => {
			expect(typed.cast(somethingAlpha, SomethingAlpha))
				.toBe(somethingAlpha);
			expect(typed.cast(somethingBeta, SomethingAlpha))
				.toBe(null);
			expect(typed.cast({}, SomethingAlpha))
				.toBe(null);
		});

		it('Cast to SomethingBeta', () => {
			expect(typed.cast(somethingAlpha, SomethingBeta))
				.toBe(null);
			expect(typed.cast(somethingBeta, SomethingBeta))
				.toBe(somethingBeta);
			expect(typed.cast({}, SomethingBeta))
				.toBe(null);
		});
	});
});
