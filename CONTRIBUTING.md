# 開発

遊び場の個人サイト。白い空間に展示がある。Web はその窓で、いまはスマホの縦スクロールとして覗く。ブログではない。顔は猫好きなシュレディンガー。本体は、あとから追加していく論理クイズ等。

アクセスは、トップ（カード一覧）、詳細 `/{slug}`、索引 `/tags`、実験場 `/lab`、CATCについて `/about。`サイト内検索も、トップの「最新」「人気」も持たない。静的生成。サーバー処理は持たない。公開は Cloudflare Workers の静的アセットで、ドメインは `cattyverse.com`、基底は `/schrodinger-likes-cats/`。

起動は [README](README.md)。

## 環境

- Node.js 24（Active LTS。このリポジトリは 24.19.0）
- npm 12

```sh
npm install
npm run dev
```

ブラウザは `http://localhost:4321/schrodinger-likes-cats/`。`http://localhost:4321/` は 404。

使うもの: Astro 7、MDX、Svelte 5、TypeScript 6、CSS、Biome。Cloudflare Workers（静的アセット）と R2。

公開は Cloudflare の Workers Builds。`main` に push すると `npm run build` が走り、`wrangler deploy` が `dist` だけを上げる。GitHub Actions は無い。`docs/` は成果物に含めない。`omit=dev` にしない（`build` が check 付き）。

展示の絵はこの流れに乗らない。原本は R2 で、リポジトリには無い（`src/public/images/` は `site` 以外 `.gitignore`）。押すのは手元から rclone で片方向。詳細は `docs/デプロイ設定.md`。

`npm run dev` と `npm run build` は、先に check する（`astro check` → `svelte-check` → Biome）。通らなければサーバも `dist` も出さない。

## 約束

- 整形と lint は Biome。Prettier と ESLint の設定は足さない
- TypeScript は 6 系。7 への上げは issue にして、勝手に `typescript@7` しない
- サーバー処理、CMS、DB は足さない。静的生成のまま
- コミットに `node_modules/`、`dist/`、`.astro/`、秘密は入れない
- 展示の絵をコミットしない。`.gitignore` の打ち消しを外さない。原本は R2

