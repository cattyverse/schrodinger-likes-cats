# 開発

遊び場の個人サイト。白い空間に展示がある。Web はその窓で、いまはスマホの縦スクロールとして覗く。ブログではない。顔は猫好きなシュレディンガー。本体は、あとから追加していく論理クイズ等。

アクセスは、トップ（カード一覧）、詳細 `/{slug}`、索引 `/tags`、実験場 `/lab`、CATCについて `/about。`サイト内検索も、トップの「最新」「人気」も持たない。静的生成。サーバー処理は持たない。公開は GitHub Pages で、基底は `/schrodinger-likes-cats/`。

起動は [README](README.md)。

## 環境

- Node.js 24（Active LTS。このリポジトリは 24.19.0）
- npm 12

```sh
npm install
npm run dev
```

ブラウザは `http://localhost:4321/schrodinger-likes-cats/`。`http://localhost:4321/` は 404。

使うもの: Astro 7、MDX、Svelte 5、TypeScript 6、CSS、Biome。GitHub Pages。

公開は `.github/workflows/deploy.yml`。公式の `withastro/action`（Node 24）。`main` に push すると `dist` だけが出る。Pages の Source は Actions。`docs/` は成果物に含めない。`gh-pages` 用の npm パッケージは使わない。CI は `omit=dev` にしない（`build` が check 付き）。

`npm run dev` と `npm run build` は、先に check する（`astro check` → `svelte-check` → Biome）。通らなければサーバも `dist` も出さない。

## 約束

- 整形と lint は Biome。Prettier と ESLint の設定は足さない
- TypeScript は 6 系。7 への上げは issue にして、勝手に `typescript@7` しない
- サーバー処理、CMS、DB は足さない。静的生成のまま
- コミットに `node_modules/`、`dist/`、`.astro/`、秘密は入れない

