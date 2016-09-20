type Comparator<T> = (element: T, index: number, array: T[]) => boolean
type CompareFromArray<T> = (fromArray: T, item: T, index: number, array: T[]) => boolean
type Sorter<T> = (rhs: T, lhs: T) => number
type Accessor<T> = (item: T) => any
type SortOptions<T> = {
	/**
	 * The property whose value to use in this sort operation.
	 */
	property?: string

	/**
	 * The accessor function that takes an item and returns a value to use in
	 *   this sort operation.
	 */
	accessor?: Accessor<T>

	/**
	 * Whether to sort in descending order (as opposed to ascending). Default is
	 *   `false`
	 */
	descending?: boolean
	/**
	 * A custom sorter. Default is to use less/greater than operator.
	 */
	sorter?: Sorter<T>
}

interface Array<T> {
	/**
	 * Removes the first instance of the item for which the comparator returns
	 *   true. If there is no such item, this does nothing.
	 *
	 * @param comp - the custom comparator
	 *
	 * @return - the removed item or undefined if no item was removed
	 */
	remove(comp: Comparator<T>, thisArg?: any): T

	/**
	 * Removes the first instance of an item that is equal, according to ===.
	 *   If there is no such item, this does nothing.
	 *
	 * @param item - the item to remove from the array
	 *
	 * @return - the removed item or undefined if it wasn't found in the array
	 */
	removeItem(item: T, thisArg?: any): T

	/**
	 * Searches for an item using the comparator function, then returns that
	 *   item.
	 *
	 * @return - that item or undefined
	 */
	find(comp: Comparator<T>, thisArg?: any): T

	/**
	 * Searches for an item using the comparator function, returns index of
	 *   that item, or -1 if not found.
	 *
	 * @return - that item's index or -1
	 */
	findIndex(comp: Comparator<T>, thisArg?: any): number

	/**
	 * The first item in this array, or undefined if there are no items.
	 */
	first: T

	/**
	 * The last item in this array, or undefined if there are no items.
	 */
	last: T

	/**
	 * Sort this array in place by a property of each item in the array,
	 *   breaking ties with other properties. You can also use sort options to
	 *   determine the order.
	 *
	 * @param propsOrOptionses - the properties and/or sort options by which to
	 *   sort and break ties.
	 *
	 * @return - this array, sorted
	 */
	sortBy(...propsOrOptionses: (string | SortOptions<T>)[]): T[]

	/**
	 * Returns whether an item for which the comparator returns true was found
	 *   in the array.
	 *
	 * @param comp - the comparator to use
	 *
	 * @return - whether the item was found in the array
	 */
	contains(comp: Comparator<T>, thisArg?: any): boolean

	/**
	 * Returns whether this item was found in the array.
	 *
	 * @param item - the item to check for
	 *
	 * @return - whether the item was found in the array
	 */
	containsItem(item: T, thisArg?: any): boolean
}

(() => {
	Object.defineProperties(Array.prototype, {
		remove: {
			value: function remove<T>(this: T[], comp: Comparator<T>, thisArg?: any): T {
				const index = this.findIndex(comp, thisArg)

				if (index >= 0) {
					return this.splice(index, 1)[0]
				}

				return undefined
			}
		},

		removeItem: {
			value: function removeItem<T>(this: T[], item: T, fromIndex = 0): T {
				const index = this.indexOf(item, fromIndex)

				if (index >= 0) {
					return this.splice(index, 1)[0]
				}

				return undefined
			}
		},

		first: {
			get: function first<T>(this: T[]) {
				return this[0]
			},
			set: function first<T>(this: T[], value: T) {
				if (this.length) {
					this[0] = value
				}
			}
		},

		last: {
			get: function last<T>(this: T[]) {
				return this[this.length - 1]
			},
			set: function last<T>(this: T[], value: T) {
				if (this.length) {
					this[this.length - 1] = value
				}
			}
		},

		sortBy: {
			value: function sortBy<T>(this: T[], ...propsOrOptionses: (string | SortOptions<T>)[]): T[] {
				const sorters: Sorter<T>[] = []

				let index = 0

				if (!propsOrOptionses.length) {
					return this
				}

				for (const propOrOptions of propsOrOptionses) {
					let descending = false,
						sorter: Sorter<T> = undefined,
						accessor: Accessor<T>

					if (typeof propOrOptions === "string") {
						accessor = (item) => item[propOrOptions]
					} else {
						const options = propOrOptions

						descending = options.descending

						// If a custom sorter is passed, the descending doesn't
						//   matter. It is ignored.
						if (typeof options.sorter === "function") {
							sorter = options.sorter
						}

						if (typeof options.property === "string") {
							accessor = (item) => item[options.property]
						} else if (typeof options.accessor === "function") {
							accessor = options.accessor
						} else {
							// Don't do any sorting here if the property or
							//   accessor isn't defined
							continue
						}
					}

					if (!sorter) {
						sorter = defaultSorter(accessor, descending)
					}

					sorters.push(sorter)
				}

				function defaultSorter(accessor: Accessor<T>, descending: boolean) {
					return (lhs: T, rhs: T) => {
						const lhv = accessor(lhs),
							rhv = accessor(rhs)

						if (lhv === rhv) {
							return 0
						}

						if (descending ? lhv < rhv : lhv > rhv) {
							return 1
						}

						return -1
					}
				}

				this.sort(recursiveSorter)

				function recursiveSorter(lhs: T, rhs: T) {
					let order = 0

					if (sorters.length > index) {
						order = sorters[index](lhs, rhs)

						if (!order) {
							index++
							order = recursiveSorter(lhs, rhs)
							index--
						}
					}

					return order
				}

				return this
			}
		},

		contains: {
			value: function contains<T>(this: T[], comp: Comparator<T>, thisArg?: any) {
				return this.findIndex(comp, thisArg) >= 0
			}
		},

		containsItem: {
			value: function containsItem<T>(this: T[], item: T, thisArg?: any) {
				return this.indexOf(item, thisArg) >= 0
			}
		}
	})
})()
