module.exports = grunt => {
	require('load-grunt-tasks')(grunt)

	grunt.initConfig({
		concat: {
			options: {
				separator: ';',
				sourceMap: true
			},
			dist: {
				src: 'build/*.js',
				dest: 'dist/dist.js',
			},
		},

		uglify: {
			options: {
				mangle: true,
				compress: true,
				sourceMap: true
			},
			dist: {
				files: {
					'dist/dist.min.js': ['dist/dist.js']
				}
			}
		}
	})

	grunt.registerTask('default', [
		'concat',
		'uglify'
	]);
}
