module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        options: {
            separator: ';'
        },
        release: {
            src: ['src/core.js', 'src/composite.js', 'src/collection.js', 'src/regionManager.js'],
            dest: '<%= pkg.name %>.js'
        }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      release: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    copy: {
        samples: {
            files: [
                {expand: true, cwd: 'components/underscore', src: ['underscore.js'], dest: 'doc/samples/vendor/'},
                {expand: true, cwd: 'components/backbone', src: ['backbone.js'], dest: 'doc/samples/vendor/'},
                {expand: true, cwd: 'components/jquery', src: ['jquery.js'], dest: 'doc/samples/vendor/'},
                {expand: true, cwd: 'components/requirejs', src: ['require.js'], dest: 'doc/samples/vendor/'},
                {expand: true, cwd: 'components/requirejs-tpl', src: ['tpl.js'], dest: 'doc/samples/vendor/'},
                {expand: true, cwd: 'src', src: ['**/*.js'], dest: 'doc/samples/vendor/fossil-view'},
                {src: ['<%= pkg.name %>.js'], dest: 'doc/samples/vendor/'}
            ]
        }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'copy']);

};
