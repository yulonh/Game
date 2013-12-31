module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    download: {
      options: {
        dest: 'src',
        transform: function(code) {
          return [
            'define(function(require, exports) {',
            'var previousUnderscore = this._;',
            'var previousJQuery = this.jQuery;',
            "this._ = require('underscore');",
            "this.jQuery = require('$');",
            code,
            "this._ = previousUnderscore;",
            "this.jQuery = previousJQuery;",
            "});"
          ].join('\n');
        }
      },
      src: {
        url: 'https://raw.github.com/documentcloud/backbone/<%= pkg.version %>/backbone.js',
        name: 'backbone.js'
      }
    }
  });
  // grunt.loadGalobalTasks ('spm-build');
  // grunt.loadTasks('../_tasks/download/tasks');
  // grunt.util._.merge(grunt.config.data, require('spm-build').config);

  var baseDir = 'dest/createjs/';

  grunt.registerTask('build', 'A sample task that logs stuff.', function() {

    var fileDetails = [];

    grunt.file.recurse('./', function(abspath, rootdir, subdir, filename) {
      var content, requires;

      if (abspath.match(/\/?src\/?/)) {

        content = grunt.file.read(abspath);
        requires = content.match(/ createjs\.\w+/g) || [];

        var len = requires.length,
          req;
        for (var i = 0; i < len; i++) {
          requires[i] = requires[i].replace('createjs.', '').trim();
        };

        fileDetails.push({
          file: abspath,
          content: content,
          requires: requires,
          destPath: abspath.replace('src/', 'dest/createjs/'),
          dirPath: abspath.substr(0, abspath.lastIndexOf('/') + 1)
        });

      };
    });

    var len = fileDetails.length,
      detail;
    for (var i = 0; i < len; i++) {
      detail = fileDetails[i];
      
    };

    grunt.log.writeln(fileDetails[0].file, fileDetails[0].requires);
    //grunt.file.write(destPath, content);

  });


};