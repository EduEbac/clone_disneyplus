const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const optipng = require("imagemin-optipng");

function styles() {
  return gulp
    .src("./src/styles/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./dist/css"));
}

function images() {
  // Copy images without in-pipeline optimization to avoid corruption
  // Use the separate `npm run images:opt` script to run optimized production builds
  return gulp.src("./src/images/**/*").pipe(gulp.dest("./dist/images"));
}

function watchFiles() {
  gulp.watch("./src/styles/*.scss", styles);
  gulp.watch("./src/images/**/*", images);
}

exports.default = gulp.series(styles, images);
exports.watch = gulp.series(styles, images, watchFiles);
