var gulp = require("gulp");
var ts = require("gulp-typescript");
var uglify = require('gulp-uglify');
const { src, dest } = require('gulp');
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(uglify('index.js')).pipe(dest("dist"));
});
