module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      dist: {
        src: ["lib/FileSaver.js", "src/main/js/Query.js", "src/main/js/Result.js", "src/main/js/ResultList.js", "src/main/js/textresults.js", "src/main/js/visualize.js",
        "src/main/js/import.js", "src/main/js/export.js"],
        dest: "build/project.js"
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/project.js',
        dest: 'build/project.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat', 'uglify']);
};