# Schrödinger Likes Cats

Playground site. Exhibits sit in a white space. The face is Schrödinger who likes cats.

公開予定: [https://cattyverse.github.io/schrodinger-likes-cats](https://cattyverse.github.io/schrodinger-likes-cats)

## 必要環境

- Node.js 24（Active LTS。このリポジトリは 24.19.0 で入れた）
- npm 12

## 手順

```sh
git clone https://github.com/cattyverse/schrodinger-likes-cats.git
cd schrodinger-likes-cats
npm install
npm run dev
```

ブラウザは `http://localhost:4321/schrodinger-likes-cats/` 。GitHub Pages の基底 `/schrodinger-likes-cats` がローカルでも付く。

公開は `main` への push で GitHub Actions が `dist` を出す。Source は Actions（リポジトリの `/docs` フォルダではない）。

## コマンド


| コマンド              | 内容                    |
| ----------------- | --------------------- |
| `npm run dev`     | 先に check、そのあと開発サーバ |
| `npm run build`   | 先に check、そのあと静的生成 |
| `npm run preview` | ビルド結果の確認 |
| `npm run check`   | `astro check` → `svelte-check` → Biome |
| `npm run format`  | Biome で直す |


整形と lint は Biome。Prettier と ESLint は使わない。TypeScript は **6 の最新**（いま 6.0.3）。7 は Astro / Svelte の型ツールが追いついてから。

## ライセンス

[MIT](LICENSE)