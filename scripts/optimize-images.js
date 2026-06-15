const imagemin = require("imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const optipng = require("imagemin-optipng");
const path = require("path");

(async () => {
  try {
    const files = await imagemin(["src/images/**/*.{jpg,jpeg,png}"], {
      destination: "dist/images",
      plugins: [mozjpeg({ quality: 75 }), optipng({ optimizationLevel: 3 })],
    });
    console.log("Optimized", files.length, "images");
  } catch (err) {
    console.error("imagemin error:", err);
    process.exit(1);
  }
})();
