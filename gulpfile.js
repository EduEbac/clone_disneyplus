const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
// Image processing with `sharp` inside Gulp
// Rationale: previous imagemin-based pipelines produced corrupted
// binaries on some setups. Using `sharp` gives deterministic
// re-encoding and avoids accidental text/encoding transformations.
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const sharp = require("sharp");

// Helper: ensure a directory exists. Equivalent to `mkdir -p`.
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
  // --- Explanation (didactic comments) ---
  // srcDir: directory where source images are stored (relative to this file)
  // outDir: where processed images will be written (dist/images)
  // path.join: joins path segments in an OS-independent way
  const srcDir = path.join(__dirname, "src", "images");
  const outDir = path.join(__dirname, "dist", "images");
  ensureDir(outDir);

  // patterns: list of glob patterns we want to process. The patterns are
  // relative to srcDir. Using glob.sync with cwd returns matching paths
  // inside the srcDir.
  const patterns = ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp"];

  // flatMap takes each pattern, runs glob.sync and flattens the arrays
  // into a single files[] array. Students unfamiliar with flatMap can
  // replace this with a simple loop + concat.
  const files = patterns.flatMap((p) =>
    glob.sync(p, { cwd: srcDir, absolute: true }),
  );

  // We return a Promise because the image processing uses async/await.
  // Gulp will wait for this Promise to resolve before finishing the task.
  return new Promise(async (resolve, reject) => {
    try {
      // Process files sequentially. This keeps memory stable and makes
      // the behavior easier to follow for educational purposes.
      for (const f of files) {
        // rel: path relative to srcDir, used to preserve folder structure
        const rel = path.relative(srcDir, f);
        const dest = path.join(outDir, rel);
        ensureDir(path.dirname(dest));

        // ext: normalized extension used to decide processing steps
        const ext = path.extname(f).toLowerCase();

        if (ext === ".jpg" || ext === ".jpeg") {
          // Re-encode JPEGs with quality 75 using mozjpeg encoder inside sharp
          // This produces a proper binary JPEG file.
          await sharp(f).jpeg({ quality: 75, mozjpeg: true }).toFile(dest);
        } else if (ext === ".png") {
          // For PNG we write with a high compression level.
          await sharp(f).png({ compressionLevel: 9 }).toFile(dest);
        } else {
          // Fallback: copy unknown formats unchanged.
          fs.copyFileSync(f, dest);
        }
      }
      // All files processed successfully
      resolve();
    } catch (err) {
      // If something fails, reject so Gulp shows the error to the student
      // and the build stops — this is better than silently producing
      // corrupted files.
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
