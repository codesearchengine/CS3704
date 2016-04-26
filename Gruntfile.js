module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      main: {
        src: ["lib/*.js", "src/main/js/*.js"],
        dest: "build/project.js"
      },
      test: {
        src: ["lib/*.js", "src/main/js/*.js", "src/test/js/test.js"],
        dest: "build/tests.js"
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        main: {
          src: 'build/project.js',
          dest: 'build/project.min.js'
        },
        test: {
          src: 'build/tests.js',
          dest: 'build/tests.min.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat:main', 'concat:test']);
};