type Watcher = (newValue: any, oldValue: any, property: string) => void

interface Object {
	/**
	 * Merge other objects into this object
	 *
	 * @param others - the other objects to be merged into this one
	 *
	 * @return {T} - the final combined object
	 */
	merge<T extends Object>(this: T, ...others: T[]): T

	/**
	 * Override a function on a specific instance only; this one. This
	 *   puts the old implementation under this._super[func], so that you
	 *   can still call the original implementation.
	 *
	 * @param func - the property corresponding to the function
	 * @param newFunc - the new function to put in its place
	 *
	 * @return {T} - this same object
	 */
	override<T extends Object>(this: T, func: string, newFunc: Function): T

	/**
	 * This sets a single property watcher on an object watching the passed
	 *   variable. It will reset all other watchers and set only the ones
	 *   passed here.
	 *
	 * @param property - the property to watch
	 * @param didSet - the callback for after setting
	 * @param willSet - the callback for before setting
	 *
	 * @return {T} this object
	 */
	setWatcher<T extends Object>(this: T, property: string, didSet?: Watcher, willSet?: Watcher): T

	/**
	 * This will add the passed watchers for the passed property.
	 *
	 * @param property - the property to watch
	 * @param didSet - the callback for after setting
	 * @param willSet - the callback for before setting
	 *
	 * @return {T} this object
	 */
	addWatcher<T extends Object>(this: T, property: string, didSet?: Watcher, willSet?: Watcher): T

	/**
	 * This will remove the passed watchers on passed property, or all watchers
	 *   if no watchers passed.
	 *
	 * @param property - the property in question
	 * @param didSet - the watcher that fires after setting
	 * @param willSet - the watcher that fires before setting
	 *
	 * @return {T} this object
	 */
	removeWatcher<T extends Object>(this: T, property?: string, didSet?: Watcher, willSet?: Watcher): T

	/**
	 * This will follow a series of ids to find a nested property.
	 *
	 * @param {...*<String>} properties - the properties to follow
	 * @return {Object?} the found property or undefined
	 */
	getNestedProperty(...properties: string[]): any

	/**
	 * Get an array of all of the values of an object's keys
	 *
	 * @return {Object[]} all of the values
	 */
	valuesArray: any[]
}

(() => {
	interface OverridenObject extends Object {
		_super: { [name: string]: Function }
	}

	interface WatchedObject extends Object {
		_values: { [property: string]: any }
		_didSets: { [property: string]: Watcher[] }
		_willSets: { [property: string]: Watcher[] }
	}

	Object.defineProperties(Object.prototype, {
		merge: {
			value: function override<T extends Object>(this: T, ...others: T[]) {
				others.forEach((one: T) => {
					if (one) {
						for (const key in one) {
							if (one.hasOwnProperty(key)) {
								const desc = Object.getOwnPropertyDescriptor(one, key)

								try {
									Object.defineProperty(this, key, desc)
								} catch (e) {
									// Silent failure on trying to override non-
									//   configurable properties.
								}
							}
						}
					}
				})

				return this
			}
		},
		override: {
			value: function override<T extends OverridenObject>(this: T, func: string, newFunc: Function): T {
				if (!this._super) {
					this._super = {}
				}

				if (!this._super[func]) {
					this._super[func] = this[func]
				}

				this[func] = newFunc

				return this
			}
		},
		setWatcher: {
			value: function setWatcher<T extends WatchedObject>(this: T, property: string, didSet?: Watcher, willSet?: Watcher): T {
				this.removeWatcher(property)

				return this.addWatcher(property, didSet, willSet)
			}
		},
		addWatcher: {
			value: function addWatcher<T extends WatchedObject>(this: T, property: string, didSet?: Watcher, willSet?: Watcher): T {
				if (!this._values) {
					Object.defineProperty(this, "_values", {
						value: {}
					})
				}

				if (!this._willSets) {
					Object.defineProperty(this, "_willSets", {
						value: {}
					})
				}

				if (!this._didSets) {
					Object.defineProperty(this, "_didSets", {
						value: {}
					})
				}

				if (typeof willSet === "function") {
					if (!this._willSets[property]) {
						this._willSets[property] = []
					}

					if (this._willSets[property].indexOf(willSet) < 0) {
						this._willSets[property].push(willSet)
					}
				}

				if (typeof didSet === "function") {
					if (!this._didSets[property]) {
						this._didSets[property] = []
					}

					if (this._didSets[property].indexOf(didSet) < 0) {
						this._didSets[property].push(didSet)
					}
				}

				const makeApplyer = (context: Object, newValue: any, oldValue: any, property: string) =>
				(callback: Watcher) => callback.call(context, newValue, oldValue, property)

				this._values[property] = this[property]
				delete this[property]

				Object.defineProperty(this, property, {
					get: function getProperty(this: WatchedObject) {
						return this._values[property]
					},
					set: function setProperty(this: WatchedObject, newValue: any) {
						const oldValue = this._values[property]

						if (this._willSets[property]) {
							this._willSets[property].forEach(makeApplyer(this, newValue, oldValue, property))
						}

						this._values[property] = newValue

						if (this._didSets[property]) {
							this._didSets[property].forEach(makeApplyer(this, newValue, oldValue, property))
						}

						return newValue
					},
					enumerable: true,
					configurable: true
				})

				return this
			}
		},
		removeWatcher: {
			value: function removeWatcher<T extends WatchedObject>(this: T, property: string, didSet?: Watcher, willSet?: Watcher) {
				if (typeof didSet !== "function" && typeof willSet !== "function") {
					// remove all callbacks for this property
					if (this._willSets && this._willSets[property]) {
						this._willSets[property].length = 0
					}

					// remove all callbacks for this property
					if (this._didSets && this._didSets[property]) {
						this._didSets[property].length = 0
					}
				} else {
					// remove just the passed watcher
					if (this._willSets && this._willSets[property] && typeof willSet === "function") {
						removeFromArray(this._willSets[property], willSet)
					}

					// remove just the passed watcher
					if (this._didSets && this._didSets[property] && typeof didSet === "function") {
						removeFromArray(this._didSets[property], didSet)
					}
				}

				function removeFromArray<T>(arr: T[], item: T) {
					const i = arr.indexOf(item)

					if (i >= 0) {
						arr.splice(i, 1)
					}
				}
			}
		},
		getNestedProperty: {
			value: function getNestedProperty(this: any, ...properties: string[]): any {
				let value = this

				for (const property of properties) {
					try {
						value = value[property]
					} catch (e) {
						return undefined
					}
				}

				return value
			}
		},
		valuesArray: {
			get: function valuesArray(this: Object): any[] {
				const values: any[] = []

				for (const key in this) {
					values.push(this[key])
				}

				return values
			}
		}
	})
})()
