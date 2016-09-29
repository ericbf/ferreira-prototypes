module.exports = grunt => {
	var path = require("path")

	require("load-grunt-tasks")(grunt)

	grunt.initConfig({
		uglify: {
			options: {
				mangle: true,
				compress: true,
				sourceMap: true,
	            sourceMapIn: "dist/dist.js.map"
			},
			dist: {
				files: {
					"dist/dist.min.js": ["dist/dist.js"]
				}
			}
		}
	})

	grunt.registerTask("tslint", function tslint() {
		var done = this.async()

		grunt.util.spawn({
			cmd: process.execPath,
			args: [path.join("node_modules", "tslint", "bin", "tslint"), "--project", "tsconfig.json", "--type-check", "--fix"]
		}, function logResult(error, result, code) {
			var message = result.stdout + result.stderr

			if (code) {
				grunt.log.warn("Typescript validation failed.\n" + message)
			} else {
				grunt.log.ok("Typescript passed validation.")

				if (result.stdout) {
					grunt.log.ok(result.stdout)
				}
			}

			done()
		})
	})

	grunt.registerTask("typescript", function typescript() {
		var done = this.async()

		grunt.util.spawn({
			cmd: process.execPath,
			args: [path.join("node_modules", "typescript", "bin", "tsc")]
		}, function logResult(error, result, code) {
			var message = result.stdout + result.stderr

			if (code) {
				grunt.log.warn("Compilation failed.\n" + message)
			} else {
				grunt.log.ok("Compiled typescript succesfully.")

				if (result.stdout) {
					grunt.log.ok(result.stdout)
				}
			}

			done()
		})
	})

	grunt.registerTask("default", [
		"tslint",
		"typescript",
		"uglify"
	])
}
