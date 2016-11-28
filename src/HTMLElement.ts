type TopAndLeft = {
	top?: number,
	left?: number
}

interface HTMLElement {
	/**
	 * Whether this element is still a child of the document's body
	 */
	readonly inDOM: boolean

	/**
	 * The highest non-null parent element of this element
	 */
	readonly highestParent: HTMLElement | undefined

	/**
	 * Get whether this element is scrollable (has overflowX or overflowY as
	 *   auto or scroll)
	 */
	readonly isScrollable: boolean

	/**
	 * Get the first parent of this element that is scrollable
	 */
	readonly scrollableParent: HTMLElement | undefined

	/**
	 * Get the top of this element from the top of the direct parent
	 */
	parentTop: number

	/**
	 * Get the top of this element from the top of the browser viewport
	 */
	absoluteTop: number

	/**
	 * Get the total offset from the top of the html tag to this element
	 */
	totalOffsetTop: number

	/**
	 * Get the left of this element from the left of the direct parent
	 */
	parentLeft: number
	/**
	 * Get the left of this element from the left of the browser viewport
	 */
	absoluteLeft: number

	/**
	 * Get the total offset from the left of the html tag to this element
	 */
	totalOffsetLeft: number

	/**
	 * Animated scroll from the current scroll to the passed value.
	 *
	 * @param {number} topOrOptions - the new scroll top value, or an options
	 *   that define either top or left.
	 * @param {number} duration - the duration to use. Default is 250.
	 * @param {string} timing - the timing function. Default is "ease-out".
	 */
	scrollTo(topOrOptions: number | TopAndLeft, duration ?: number, timing ?: string): void

	/**
	 * Try to animatedly scroll this into view, if needed.
	 *
	 * @param {number} duration - the duration to use. Default is 250.
	 * @param {string} timing - the timing function. Default is "ease-out".
	 */
	scrollIntoViewIfNeeded(duration ?: number, padding ?: number, timing ?: string): void
}

(() => {
	if (!HTMLElement) {
		return
	}

	type Animator = (time: number) => boolean

	function addAnimator(animator: Animator) {
		window.requestAnimationFrame((now) => animator(now) && addAnimator(animator))
	}

	Object.defineProperties(HTMLElement.prototype, {
		inDOM: {
			get: function inDOM(this: HTMLElement): boolean {
				return document.documentElement.contains(this)
			}
		},

		highestParent: {
			get: function highestParent(this: HTMLElement): HTMLElement | undefined {
				let parent = this

				while (parent.parentElement) {
					parent = parent.parentElement
				}

				return parent
			}
		},

		isScrollable: {
			get: function(this: HTMLElement): boolean {
				const style = window.getComputedStyle(this)

				return style.overflowY === "auto" || style.overflowY === "scroll"
			}
		},

		scrollableParent: {
			get: function(this: HTMLElement): HTMLElement | undefined {
				let parent = this.parentElement

				while (parent && !parent.isScrollable) {
					parent = parent.parentElement
				}

				return parent
			}
		},

		parentTop: {
			get: function(this: HTMLElement): number {
				let offset = this.totalOffsetTop

				if (!this.parentElement) {
					return offset
				}

				return offset - this.parentElement.totalOffsetTop
			}
		},

		absoluteTop: {
			get: function(this: HTMLElement): number {
				let element = this,
					offset = 0

				do {
					offset += element.parentTop

					if (element.parentElement) {
						offset -= element.parentElement.scrollTop
					}

					element = element.parentElement
				} while (element)

				return offset
			}
		},

		totalOffsetTop: {
			get: function(this: HTMLElement): number {
				let element = this,
					offset = 0

				do {
					offset += element.offsetTop
					element = element.offsetParent as HTMLElement
				} while (element)

				return offset
			}
		},

		parentLeft: {
			get: function(this: HTMLElement): number {
				let offset = this.totalOffsetLeft

				if (!this.parentElement) {
					return offset
				}

				return offset - this.parentElement.totalOffsetLeft
			}
		},

		absoluteLeft: {
			get: function(this: HTMLElement): number {
				let element = this,
					offset = 0

				do {
					offset += element.parentLeft

					if (element.parentElement) {
						offset -= element.parentElement.scrollLeft
					}

					element = element.parentElement
				} while (element)

				return offset
			}
		},

		totalOffsetLeft: {
			get: function(this: HTMLElement): number {
				let element = this,
					offset = 0

				do {
					offset += element.offsetLeft
					element = element.offsetParent as HTMLElement
				} while (element)

				return offset
			}
		},

		scrollTo: {
			value: function(this: HTMLElement, topOrOptions: number | TopAndLeft, duration = 250, timing = "ease-out") {
				const startTime = performance.now()

				let targetTop: number | undefined,
					targetLeft: number | undefined

				if (typeof topOrOptions === "number") {
					targetTop = topOrOptions
				} else {
					targetTop = topOrOptions.top
					targetLeft = topOrOptions.left
				}

				if (typeof targetTop === "number") {
					const start = this.scrollTop,
						target = targetTop,
						down = target > start,
						tween = makeTween(start, target, duration, timing)

					let expected = start

					addAnimator((time) => {
						const current = this.scrollTop,
							newScroll = tween(time - startTime)

						if (time > startTime + duration || (down ? newScroll >= target : newScroll <= target)) {
							this.scrollTop = target
						} else if (current === expected) {
							this.scrollTop = newScroll

							expected = this.scrollTop

							return true
						}

						return false
					})
				}

				if (typeof targetLeft === "number") {
					const start = this.scrollLeft,
						target = targetLeft,
						right = target > start,
						tween = makeTween(start, target, duration, timing)

					let expected = start

					addAnimator((time) => {
						const current = this.scrollLeft,
							newScroll = tween(time - startTime)

						if (time > startTime + duration || (right ? newScroll >= target : newScroll <= target)) {
							this.scrollLeft = target
						} else if (current === expected) {
							this.scrollLeft = newScroll

							expected = this.scrollLeft

							return true
						}

						return false
					})
				}

				function makeTween(start: number, end: number, duration: number, timing?: string): (time: number) => number {
					let valueMaker: (x: number) => number

					switch (timing) {
						case "linear":
							valueMaker = function valueMaker(x) {
								return x
							}

							break
						case "ease-out":
						default:
							valueMaker = function valueMaker(x) {
								return -Math.pow(x - 1, 2) + 1
							}

							break
					}

					return function tween(time) {
						return (end - start) * valueMaker(duration > 0 ? time / duration : 1) + start
					}
				}
			}
		},

		scrollIntoViewIfNeeded: {
			value: function(this: HTMLElement, duration ?: number, padding = 0, timing ?: string) {
				type Scroller = {
					element: HTMLElement
					viewport: {
						width: number
						height: number
					}

					scrollLeft: number
					offsetLeft: number
					width: number

					scrollTop: number
					offsetTop: number
					height: number
				}

				const scrollers: Scroller[] = []

				for (let curr = this, child = this, offsetTop = 0, offsetLeft = 0; curr.parentElement; curr = curr.parentElement) {
					offsetTop += curr.parentTop
					offsetLeft += curr.parentLeft

					if (curr.parentElement.isScrollable) {
						scrollers.push({
							element: curr.parentElement,
							viewport: {
								width: curr.parentElement.clientWidth,
								height: curr.parentElement.clientHeight
							},

							scrollLeft: curr.parentElement.scrollLeft,
							offsetLeft: offsetLeft,
							width: child.offsetWidth,

							scrollTop: curr.parentElement.scrollTop,
							offsetTop: offsetTop,
							height: child.offsetHeight
						})

						offsetTop = 0
						child = curr.parentElement
					}
				}

				scrollers.forEach(function doScroll(options) {
					let scrollTop = options.scrollTop,
						scrollLeft = options.scrollLeft

					if (options.offsetTop + options.height > options.viewport.height + options.scrollTop - padding) {
						// Element needs scroll up into the view
						scrollTop = options.offsetTop + options.height - options.viewport.height + padding
					} else if (options.offsetTop < options.scrollTop + padding) {
						// Element needs scroll down into the view
						scrollTop = options.offsetTop - padding
					}

					if (options.offsetLeft + options.width > options.viewport.width + options.scrollLeft - padding) {
						// Element needs scroll left into the view
						scrollLeft = options.offsetLeft + options.width - options.viewport.width + padding
					} else if (options.offsetLeft < options.scrollLeft + padding) {
						// Element needs scroll right into the view
						scrollLeft = options.offsetLeft - padding
					}

					options.element.scrollTo({
						top: scrollTop,
						left: scrollLeft
					}, duration, timing)
				})
			}
		}
	})
})()
