module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildsrc: ['src/core.js', 'src/composite.js', 'src/collection.js', 'src/regionManager.js'],
    qunit: {
        all: {
            options: {
                urls: [
                    'http://localhost:8000/tests/test.html'
                ]
            }
        }
    },
    connect: {
        server: {
            options: {
                port: 8000,
                base: '.',
                hostname: '*'
            }
        }
    },
    concat: {
        library: {
            options: {
                banner: "(function (_, Backbone, jQuery, Fossil) {\n",
                footer: [
                    "return Fossil.Views;",
                    "})(_, Backbone, jQuery, this.Fossil || (this.Fossil = {}));"
                ].join("\n")
            },
            src: '<%= buildsrc %>',
            dest: '<%= pkg.name %>.js'
        },
        amd: {
            options: {
                banner: "define('fossil-view', ['underscore', 'backbone', 'jquery', 'fossil'], function (_, Backbone, jQuery, Fossil) {\n",
                footer: [
                    "return Fossil.Views;",
                    "});"
                ].join("\n")
            },
            src: '<%= buildsrc %>',
            dest: '<%= pkg.name %>-amd.js'
        }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      library: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      },
      amd: {
        src: '<%= pkg.name %>-amd.js',
        dest: '<%= pkg.name %>-amd.min.js'
      }
    },
    copy: {
        vendors: {
            files: [
                // copy dependencies for samples
                {expand: true, cwd: 'bower_components', src: [
                        'qunit/qunit.css',
                        'qunit/qunit.js',
                        'underscore/underscore.js',
                        'backbone/backbone.js',
                        'jquery/jquery.js',
                        'jquery-color/jquery.color.js',
                        'requirejs/require.js',
                        'requirejs-tpl/tpl.js'
                    ], dest: 'doc/components/'},
                {expand: true, src: ['<%= pkg.name %>.js'], dest: 'doc/'},
                {expand: true, src: ['<%= pkg.name %>.amd.js'], dest: 'doc/'},
                {expand: true, cwd: 'src', src: ['**/*.js'], dest: 'doc/src/'}

            ]
        },
        samples: {
            files: [
                // copy samples to gh-pages
                {expand: true, cwd: 'samples', src: ['**'], dest: 'doc/samples/'}
            ]
        },
        tests: {
            files: [
                // copy tests to gh-pages
                {expand: true, cwd: 'tests', src: ['**'], dest: 'doc/tests/'}
            ]
        }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('test', ['connect', 'qunit']);
  grunt.registerTask('release', ['concat', 'uglify', 'copy']);
  grunt.registerTask('default', ['release']);

};
