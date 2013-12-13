module.exports = function(grunt){

  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: 'src/activity-graph.js',
      test: 'test/activity-graph.js'
    },

    watch: {
      files: ['<%= jshint.src %>', '<%= jshint.test %>'],
      tasks: 'test'
    },

    jasmine: {
      pivotal: {
        src: '<%= jshint.src %>',
        options: {
          specs: '<%= jshint.test %>',
          helpers: 'test/helper.js',
          keepRunner: true,
          outfile: 'SpecRunner.html'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('start', ['test', 'watch']);

};