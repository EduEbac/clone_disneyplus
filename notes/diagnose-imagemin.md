Diagnóstico e solução: gulp-imagemin corrompendo JPEGs

Resumo

Durante o build o pipeline de imagens estava gerando arquivos JPEG corrompidos em `dist/images` (Preview inválido no navegador e Finder incapaz de abrir alguns arquivos).

Causa provável

- Versões e comportamento do conjunto de plugins do `gulp-imagemin` podem variar por plataforma e dependências internas.
- O `imagemin` padrão (usado pelo `gulp-imagemin`) pode aplicar plugins/transformações que, em combinação com certos arquivos (ex: JPEGs com metadados/progressive), acabem produzindo arquivos inválidos em algumas versões.

O que foi alterado

1. Adicionei dependências explícitas ao `package.json`:
   - `imagemin-mozjpeg`@^8.0.0
   - `imagemin-optipng`@^7.0.0

2. Atualizei `gulpfile.js` para usar esses plugins explicitamente:
   - `imagemin([ mozjpeg({quality:75}), optipng({optimizationLevel:3}) ])`
   - Isso dá controle sobre a compressão (qualidade/nível) e evita transformar arquivos com plugins incompatíveis.

3. Antes de aplicar a correção eu tinha temporariamente desabilitado a otimização (cópia direta) para evitar corrupção durante o desenvolvimento. Agora o pipeline completo usa os plugins explícitos.

Como testar localmente

No diretório do projeto execute:

```bash
npm install
npm run build
```

Verifique `dist/images` e abra os arquivos com o Finder ou no navegador. No DevTools, aba `Network` verifique o status e preview das imagens.

Opções futuras

- Separar `images:dev` (cópia) e `images:prod` (otimização) para evitar tempo de processamento em dev e garantir segurança em produção.
- Ajustar `quality`/`optimizationLevel` conforme necessidade de qualidade vs tamanho.
- Substituir por outra estratégia (ex: usar um serviço externo de otimização ou `sharp`) se precisar de compressão avançada.

Observações

- `gulp-imagemin` instalado na versão `7.x` (que usa `imagemin@^7.0.0`) é compatível com os plugins usados; preferimos declarar os plugins explicitamente para evitar comportamento implícito.
- Se alguém ainda tiver problemas com um arquivo específico, tente reproduzir a conversão local usando `imagemin-cli` ou `imagemin-mozjpeg` diretamente para isolar o caso.
 - Se alguém ainda tiver problemas com um arquivo específico, tente reproduzir a conversão local usando `imagemin-cli` ou `imagemin-mozjpeg` diretamente para isolar o caso.

Atualização: para evitar corrupção no pipeline do Gulp, criei um script separado `scripts/optimize-images.js` que usa `imagemin` + plugins (`imagemin-mozjpeg` e `imagemin-optipng`) para otimização fora do Gulp. Além disso, `images()` no `gulpfile.js` foi revertida para copiar sem otimização. Use `npm run images:opt` para otimizar manualmente.

Removido de package.json     // "gulp-imagemin": "^7.1.0",