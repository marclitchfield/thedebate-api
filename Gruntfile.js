module.exports = function(grunt) {
  grunt.initConfig({

    jshint: {
      files: ['**/*.js', '!**/node_modules/**'],
      options: {
        globals: {
        }
      }
    },

    watch: {
      scripts: {
        files: ['**/*.js', '!**/node_modules/**'],
        tasks: ['jshint'],
        options: {
          spawn: false
        },
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint']);
};