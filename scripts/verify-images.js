const fs = require("fs");
const path = require("path");
const glob = require("glob");

function isJpeg(buffer) {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function isPng(buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

const imagesDir = path.join(__dirname, "..", "dist", "images");
const patterns = ["**/*.jpg", "**/*.jpeg", "**/*.png"];
let invalid = [];

patterns.forEach((pat) => {
  const files = glob.sync(pat, { cwd: imagesDir, nodir: true });
  files.forEach((file) => {
    const full = path.join(imagesDir, file);
    try {
      const fd = fs.openSync(full, "r");
      const buf = Buffer.alloc(8);
      const read = fs.readSync(fd, buf, 0, 8, 0);
      fs.closeSync(fd);
      if (!isJpeg(buf) && !isPng(buf)) {
        invalid.push(full);
      }
    } catch (err) {
      invalid.push(full + " (read error: " + err.message + ")");
    }
  });
});

if (invalid.length) {
  console.error("Image verification failed for the following files:");
  invalid.forEach((f) => console.error(" -", f));
  process.exit(2);
} else {
  console.log("All images in dist/images passed basic verification.");
}
