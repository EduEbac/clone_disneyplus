# Clone Disney+ — Build & Imagens

Resumo rápido

Este projeto usa Gulp para compilar SCSS → CSS e um script baseado em `sharp` para otimizar imagens sem corrompê-las.

Scripts importantes

- `npm install` — instala dependências de desenvolvimento.
- `npm run build` — compila `src/styles/*.scss` → `dist/css` e processa imagens (via `sharp`) para `dist/images` (modo rápido/desenvolvimento).
- `npm run watch` / `npm run dev` — roda `gulp watch` (recompila ao salvar).
- `npm run images:opt` — otimiza imagens com o script `scripts/optimize-images-sharp.js` (específico para produção se quiser otimizações extra).
- `npm run verify-images` — verifica magic-bytes (JPEG/PNG) em `dist/images` para garantir arquivos válidos.
- `npm run build:prod` — `images:opt` → `verify-images` → `build` (recomendado para CI / deploy).

Diagnóstico e contexto

Havia um problema com compressão automática que corrompia alguns JPEGs no ambiente local (provavelmente comportamento de um plugin). Para evitar isso:

- o pipeline do Gulp processa imagens com `sharp` de forma segura;
- há um script separado para otimização em lote (`images:opt`) e uma verificação (`verify-images`).

