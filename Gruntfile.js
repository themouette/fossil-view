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

    requirejs: {
        standalone: {
            options: {
                out: '<%= pkg.name %>.js',
                optimize: 'none',
                baseUrl: 'src/',
                include: [ 'view', 'collection', 'composite', 'regionManager' ],
                wrap: {
                    startFile: [ 'build/templates/header_1.js', 'bower_components/almond/almond.js', 'build/templates/header_2.js' ],
                    endFile: 'build/templates/footer.js'
                },
                paths: {
                    'underscore': 'empty:',
                    'backbone': 'empty:'
                }
            }
        }
    },

    watch: {
        standalone: {
            files: ['build/templates/**/*', 'bower_components/almond/almond.js', 'src/**/*.js'],
            tasks: ['requirejs:standalone']
        }
    },

    concurrent: {
        dev: {
            options: {
                logConcurrentOutput: true
            },
            tasks: ['connect:server:keepalive', 'watch:standalone']
        }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      library: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
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
                    ], dest: 'doc/bower_components/'},
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
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default task(s).
  grunt.registerTask('test', ['connect', 'qunit']);

  grunt.registerTask('build:dev', ['requirejs:standalone']);
  grunt.registerTask('dev', ['build:dev', 'concurrent:dev']);

  grunt.registerTask('build:release', ['requirejs:standalone', 'uglify', 'copy']);

  grunt.registerTask('release', ['test', 'build:release']);
  grunt.registerTask('default', ['release']);

};
