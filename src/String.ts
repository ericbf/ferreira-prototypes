interface String {
	/**
	 * Whether this string contains the passed string.
	 *
	 * @param str - the string to find
	 * @param caseInsensitve - whether to care about case. Default is false.
	 *
	 * @return - whether the substring was found
	 */
	contains(str: string, caseInsensitve?: boolean): boolean

	/**
	 * Tries to turn this sentence string into Title Case.
	 *
	 * @return - the Title Case string
	 */
	toTitleCase(): string

	/**
	 * Tries to turn this identifier string into snake-case.
	 *
	 * @return - the snake-case identifier
	 */
	toSnakeCase(): string

	/**
	 * Tries to turn this identifier string into camelCase.
	 *
	 * @return - the camelCase identifier
	 */
	toCamelCase(): string

	/**
	 * Gets a property escaped string ready for use in regular expressions
	 *
	 * @return - this string escaped for regular expressions
	 */
	toRegExpEscaped(): string
}

(() => {
	// Common words that are usually lowercase unless they are the first
	//   word in the sentence.
	const lowers = [
			"A", "An", "The", "And", "But", "Or", "For", "Nor", "As", "At",
			"By", "For", "From", "In", "Into", "Near", "Of", "On", "Onto", "To", "With"
		],

		// Certain words have special case.
		specials = [{
			expect: "Ios",
			desire: "iOS"
		}, {
			expect: "Iphone",
			desire: "iPhone"
		}, {
			expect: "Ipad",
			desire: "iPad"
		}, {
			expect: "Ipod",
			desire: "iPod"
		}, {
			expect: "Watchos",
			desire: "watchOS"
		}, {
			expect: "Macos",
			desire: "macOS"
		}, {
			expect: "Os",
			desire: "OS"
		}, {
			expect: "Htc",
			desire: "HTC"
		}, {
			expect: "Zte",
			desire: "ZTE"
		}],

		ignores = [
			"US",
			"RIM"
		]

	Object.defineProperties(String.prototype, {
		contains: {
			value: function contains(this: string, str: string, caseInsensitve = false) {
				return new RegExp(str.toRegExpEscaped(), caseInsensitve ? "i" : "").test(this)
			}
		},

		toTitleCase: {
			value: function toTitleCase(this: string) {
				let str = this.replace(/([^\W_]+[^\s-]*) */g, (txt) => {
					if (ignores.indexOf(txt) >= 0) {
						return txt
					}

					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
				})

				for (const lower of lowers) {
					str = str.replace(new RegExp("[\\s\\-]" + lower + "[\\s\\-]", "g"), (txt) => txt.toLowerCase())
				}

				for (const special of specials) {
					str = str.replace(new RegExp("[\\s\\-]" + special.expect + "[\\s\\-]", "g"), special.desire)
				}

				return str
			}
		},

		toSnakeCase: {
			value: function toSnakeCase(this: string) {
				if (/^[A-Z_0-9]+$/.test(this)) {
					return this.toLowerCase().replace(/_/g, "-")
				}

				return this.replace(/(?!^)([A-Z])/g, "-$1").toLowerCase()
			}
		},

		toCamelCase: {
			value: function toSnakeCase(this: string) {
				return this.toLowerCase().replace(/(?!^)[_-]([a-z])/g, (_: string, match: string) => match.toUpperCase())
			}
		},

		toRegExpEscaped: {
			value: function toRegExpEscaped(this: string) {
				return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
			}
		}
	})
})()
