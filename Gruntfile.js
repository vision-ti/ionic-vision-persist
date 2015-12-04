module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.initConfig({
        uglify: {
            dist: {
                options: {report: 'gzip'},
                src: "dist/ionic-vision-persist.js",
                dest: "dist/ionic-vision-persist.min.js"
            }
        }
    });

    grunt.registerTask("default", ['uglify']);
};