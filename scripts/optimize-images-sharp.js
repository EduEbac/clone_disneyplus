const fs = require("fs");
const path = require("path");
const glob = require("glob");
const sharp = require("sharp");

const srcDir = path.join(__dirname, "..", "src", "images");
const outTmp = path.join(__dirname, "..", "dist", "images.tmp");
const outDir = path.join(__dirname, "..", "dist", "images");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function processFile(file) {
  const rel = path.relative(srcDir, file);
  const destTmp = path.join(outTmp, rel);
  ensureDir(path.dirname(destTmp));

  const ext = path.extname(file).toLowerCase();
  try {
    if (ext === ".jpg" || ext === ".jpeg") {
      await sharp(file).jpeg({ quality: 75, mozjpeg: true }).toFile(destTmp);
    } else if (ext === ".png") {
      await sharp(file).png({ compressionLevel: 9 }).toFile(destTmp);
    } else {
      // copiar outros arquivos
      fs.copyFileSync(file, destTmp);
    }
    return { file: rel, ok: true };
  } catch (err) {
    return { file: rel, ok: false, error: err.message };
  }
}

(async () => {
  ensureDir(outTmp);
  // inclui SVGs para que ícones/recursos vetoriais sejam copiados para dist sem alteração
  const patterns = ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp", "**/*.svg"];
  let files = [];
  patterns.forEach((p) => {
    files = files.concat(glob.sync(p, { cwd: srcDir, absolute: true }));
  });

  if (!files.length) {
    console.log("No images found in", srcDir);
    process.exit(0);
  }

  const results = [];
  for (const f of files) {
    // ignora diretórios
    const stat = fs.statSync(f);
    if (!stat.isFile()) continue;
    // processar
    // eslint-disable-next-line no-await-in-loop
    const res = await processFile(f);
    results.push(res);
    if (!res.ok) console.error("Failed:", res.file, res.error);
  }

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error("Some images failed to optimize. Aborting.");
    process.exit(2);
  }

  // substituir outDir de forma atômica
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.renameSync(outTmp, outDir);

  const before = files.length;
  console.log(`Optimized ${before} images -> ${outDir}`);
})();
