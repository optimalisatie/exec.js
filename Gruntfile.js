/* global module:false */
module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*! Cancellable Javascript Code Runner v<%= pkg.version %>\n * @link https://github.com/optimalisatie/exec.js */\n',
            bannerFetch: '/*! Cancellable Fetch (exec.js v<%= pkg.version %>)\n * @link https://github.com/optimalisatie/exec.js */\n'
        },

        'closure-compiler': {
            'exec.js': {
                closurePath: 'closure-compiler',
                js: 'exec.js',
                jsOutputFile: 'exec.min.js',
                //reportFile: 'public/js/closure-compiler/reports/pagespeed+' + keys.join('+') + '.txt',
                noreport: true,
                maxBuffer: 500,
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT',
                    externs: ['./closure-compiler/exec.js']
                }
            },
            'exec-fetch.js': {
                closurePath: 'closure-compiler',
                js: 'exec-fetch.js',
                jsOutputFile: 'exec-fetch.min.js',
                //reportFile: 'public/js/closure-compiler/reports/pagespeed+' + keys.join('+') + '.txt',
                noreport: true,
                maxBuffer: 500,
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT',
                    externs: ['./closure-compiler/exec.js']
                }
            }
        },

        usebanner: {
            'exec.js': {
                options: {
                    position: 'replace',
                    banner: '<%= meta.banner %>',
                    linebreak: false
                },
                files: {
                    src: ['exec.min.js']
                }
            },
            'exec-fetch.js': {
                options: {
                    position: 'replace',
                    banner: '<%= meta.bannerFetch %>',
                    linebreak: false
                },
                files: {
                    src: ['exec-fetch.min.js']
                }
            }
        }

    });

    // Load Dependencies
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('build', ['closure-compiler', 'usebanner']);
    grunt.registerTask('default', ['build']);
};