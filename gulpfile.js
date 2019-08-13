// PATHS
const src = "./src/",
	dist = "./dist/",
	node = "./node_modules/",
	assets = dist + "assets/",
	subs = "**/*";

// PLUGINS
const gulp = require('gulp'),
	del = require("del"),
	concat = require("gulp-concat"),
	uglify = require('gulp-uglify-es').default;

// TASK MODULES
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
// javascript
function pipeJs(cb) {
	gulp.src([src + "js/*.js"])
		.pipe(concat("blueJump.js"))
		.pipe(uglify())
		.pipe(gulp.dest(assets + "js/"));
	cb();
}

// TASK COMPOSITIONS
// builds assets
const generate = gulp.parallel(pipeJs, pipeImg, pipeHtml);
// cleans, then builds
const build = gulp.series(clean, generate);

// exports
exports.clean = clean;
exports.build = build;
exports.default = build;
