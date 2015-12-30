module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        nodeunit: {
          all: ['build/test/'],
          options : {
            reporter: 'verbose'
          }
        },

        ts: {
            default: {
                tsconfig: true, /* Go find config in tsconfig.json */
                options: { verbose: true }
            },
            tests: {
              tsconfig: "tsconfig-test.json",
              options: { verbose: true }
            }
        },

        copy: {
          d_ts : {
            files: [
              { expand: true, src: ["src/parser/Parser.d.ts"], dest: "build/src/parser", filter: 'isFile' }
            ]
          }
        },

        jison: {
          target: {
            options: {
              moduleType: 'commonjs',
              moduleParser: 'lalr',
              moduleName: 'Parser'
            },
            files: {
              'build/src/parser/parser.js' : ['src/parser/parser.jison', 'src/parser/parser.jisonlex']
            }
          }
        }
    });


    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-jison');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('test', ['jison', 'copy:d_ts', 'ts:default', 'ts:tests', 'nodeunit']);
    grunt.registerTask('default', ['jison', 'copy:d_ts', 'ts:default']);
};
