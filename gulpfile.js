// PATHS
const src = "./src/",
	dist = "./dist/",
	node = "./node_modules/",
	assets = dist + "assets/",
	subs = "**/*";

// PLUGINS
const gulp = require('gulp'),
	del = require("del"),
	gutil = require('gulp-util'),
	sourcemaps = require("gulp-sourcemaps"),
	concat = require("gulp-concat"),
	uglify = require('gulp-uglify-es').default;

// TASK MODULES
// error reporting
function logError(error) {
	gutil.log(
		gutil.colors.red('\n!! !! !!\n!! !! !!\n!! !! !!'),
		"\nERROR OCCURRED"
	);
	gutil.log(gutil.colors.red('[Error]'), error.toString());
}
// cleanup
function clean(cb) {
	// delete all existing assets and html to prevent caching issues
	del([assets + subs + ".*", dist + subs + ".html"]);
	cb();
}
// images
function pipeImg(cb) {
	// copy all images from src to dist
	gulp.src(src + "images/" + subs)
		.pipe(gulp.dest(assets + "img/"));
	cb();
}
// html
function pipeHtml(cb) {
	gulp.src(src + subs + ".html")
		.pipe(gulp.dest(dist));
	cb();
}
// fonts
function pipeFonts(cb) {
	gulp.src(src + "fonts/*.ttf")
		.pipe(gulp.dest(assets + "fonts/"));
	cb();
}
// javascript
function pipeJs(cb) {
	// p5.js
	gulp.src(node + "p5/lib/p5.js")
		.pipe(gulp.dest(assets + "js/"));
	// custom files
	gulp.src([src + "js/*.js"]).on("error", logError)
		.pipe(sourcemaps.init())
		.pipe(concat("blueJump.js")).on("error", logError)
		.pipe(uglify()).on("error", logError)
		// todo: add .min suffix
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(assets + "js/")).on("error", logError);
	cb();
}

// TASK COMPOSITIONS
// builds assets
const generate = gulp.parallel(pipeJs, pipeImg, pipeHtml, pipeFonts);
// cleans, then builds
const build = gulp.series(clean, generate);

// exports
exports.clean = clean;
exports.build = build;
exports.default = build;
