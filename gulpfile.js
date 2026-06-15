const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
// image optimization: use sharp directly in the gulp task so build (dev/prod) is consistent
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const sharp = require("sharp");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function styles() {
  return gulp
    .src("./src/styles/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./dist/css"));
}

function images() {
  // Process images via sharp to avoid previous imagemin corruption issues
  const srcDir = path.join(__dirname, "src", "images");
  const outDir = path.join(__dirname, "dist", "images");
  ensureDir(outDir);

  const patterns = ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp"];
  const files = patterns.flatMap((p) =>
    glob.sync(p, { cwd: srcDir, absolute: true }),
  );

  return new Promise(async (resolve, reject) => {
    try {
      for (const f of files) {
        const rel = path.relative(srcDir, f);
        const dest = path.join(outDir, rel);
        ensureDir(path.dirname(dest));
        const ext = path.extname(f).toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg") {
          await sharp(f).jpeg({ quality: 75, mozjpeg: true }).toFile(dest);
        } else if (ext === ".png") {
          await sharp(f).png({ compressionLevel: 9 }).toFile(dest);
        } else {
          fs.copyFileSync(f, dest);
        }
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function watchFiles() {
  gulp.watch("./src/styles/*.scss", styles);
  gulp.watch("./src/images/**/*", images);
}

exports.default = gulp.series(styles, images);
exports.watch = gulp.series(styles, images, watchFiles);
