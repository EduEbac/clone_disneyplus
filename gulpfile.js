const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
// Processamento de imagens com `sharp` dentro do Gulp
// Motivo: pipelines anteriores baseados em imagemin produziram binários
// corrompidos em alguns ambientes. Usar `sharp` fornece re-encoding
// determinístico e evita transformações indesejadas no binário.
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const sharp = require("sharp");

// Função auxiliar: garante que um diretório exista. Equivalente a `mkdir -p`.
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
  // --- Explicação (comentários didáticos) ---
  // srcDir: diretório onde estão as imagens de origem (relativo a este arquivo)
  // outDir: onde as imagens processadas serão gravadas (dist/images)
  // path.join: une segmentos de caminho de forma independente do sistema operacional
  const srcDir = path.join(__dirname, "src", "images");
  const outDir = path.join(__dirname, "dist", "images");
  ensureDir(outDir);

  // patterns: lista de padrões glob para processarmos. Os padrões são
  // relativos a srcDir. Usar glob.sync com cwd retorna caminhos
  // correspondentes dentro de srcDir.
  // inclui SVGs para que ícones/recursos vetoriais sejam copiados para dist sem alteração
  const patterns = ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp", "**/*.svg"];

  // flatMap executa glob.sync para cada padrão e achata os arrays
  // em um único array files[]. Estudantes não familiarizados com flatMap
  // podem substituir por um loop simples + concat.
  const files = patterns.flatMap((p) =>
    glob.sync(p, { cwd: srcDir, absolute: true }),
  );

  // Retornamos uma Promise porque o processamento de imagens usa async/await.
  // O Gulp aguardará essa Promise resolver antes de finalizar a tarefa.
  return new Promise(async (resolve, reject) => {
    try {
      // Processa os arquivos sequencialmente. Isso mantém o uso de memória estável e
      // torna o comportamento mais fácil de acompanhar para fins didáticos.
      for (const f of files) {
        // rel: caminho relativo a srcDir, usado para preservar a estrutura de pastas
        const rel = path.relative(srcDir, f);
        const dest = path.join(outDir, rel);
        ensureDir(path.dirname(dest));

        // ext: extensão normalizada usada para decidir os passos de processamento
        const ext = path.extname(f).toLowerCase();

        if (ext === ".jpg" || ext === ".jpeg") {
          // Re-encoda JPEGs com qualidade 75 usando mozjpeg via sharp
          // Isso produz um arquivo JPEG binário adequado.
          await sharp(f).jpeg({ quality: 75, mozjpeg: true }).toFile(dest);
        } else if (ext === ".png") {
          // Para PNG escrevemos com alto nível de compressão.
          await sharp(f).png({ compressionLevel: 9 }).toFile(dest);
        } else {
          // Fallback: copia formatos desconhecidos sem alterações.
          fs.copyFileSync(f, dest);
        }
      }
      // All files processed successfully
      resolve();
    } catch (err) {
      // Se algo falhar, rejeitamos para que o Gulp mostre o erro ao aluno
      // e o build seja interrompido — isso é preferível a produzir arquivos
      // corrompidos silenciosamente.
      reject(err);
    }
  });
}

function watchFiles() {
  gulp.watch("./src/styles/*.scss", styles);
  gulp.watch("./src/images/**/*", images);
}

function copyJs() {
  // copia o JS de src para dist/js para que o site buildado seja autônomo
  return gulp.src('./src/main.js').pipe(gulp.dest('./dist/js'));
}

function copyHtml() {
  // copia o index.html para dist para que o diretório de saída esteja completo
  return gulp.src('./index.html').pipe(gulp.dest('./dist'));
}

function fixHtmlPaths(done) {
  // Ajusta paths dentro de dist/index.html para que sejam relativos ao próprio dist/
  const file = path.join(__dirname, 'dist', 'index.html');
  if (!fs.existsSync(file)) return done();
  let content = fs.readFileSync(file, 'utf8');

  // Regras de substituição:
  // - ./dist/css/main.css -> ./css/main.css
  // - ./dist/images/...    -> ./images/...
  // - ./src/main.js        -> ./js/main.js (copiado por copyJs)
  content = content.replace(/href="\.\/dist\/css\//g, 'href="./css/');
  content = content.replace(/src="\.\/dist\/images\//g, 'src="./images/');
  content = content.replace(/src="\.\/src\/main\.js"/g, 'src="./js/main.js"');

  fs.writeFileSync(file, content, 'utf8');
  return done();
}

exports.default = gulp.series(styles, images, copyJs, copyHtml, fixHtmlPaths);
exports.watch = gulp.series(styles, images, copyJs, copyHtml, fixHtmlPaths, watchFiles);
