# Schrödinger Likes Cats

Playground site. Exhibits sit in a white space. The face is Schrödinger who likes cats.

公開: [https://cattyverse.com/schrodinger-likes-cats](https://cattyverse.com/schrodinger-likes-cats)

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

ブラウザは `http://localhost:4321/schrodinger-likes-cats/` 。基底 `/schrodinger-likes-cats` がローカルでも付く。

公開は `main` への push。Cloudflare の Workers Builds が `npm run build` し、`dist` を Workers へ上げる。GitHub Actions は使わない。

## 画像はクローンに入らない

展示の絵はこのリポジトリに無い。原本は Cloudflare R2 で、配信は `https://assets.cattyverse.com/schrodinger-likes-cats/…`。`src/public/images/` は `site`（ロゴなど）以外 `.gitignore` にある。

クローンしただけの状態では、`npm run dev` で展示の絵が出ない（`missing.svg` になる）。絵を触るなら、R2 から手元の `src/public/images/{slug}/` へ落としてくる。押し戻すのは rclone で、手動・片方向（`docs/デプロイ設定.md`）。

R2 にはバージョニングが無い。上書きすると戻せない。

## コマンド


| コマンド              | 内容                                     |
| ----------------- | -------------------------------------- |
| `npm run dev`     | 先に check、そのあと開発サーバ                     |
| `npm run build`   | 先に check、そのあと静的生成                      |
| `npm run preview` | ビルド結果の確認                               |
| `npm run check`   | `astro check` → `svelte-check` → Biome |
| `npm run format`  | Biome で直す                              |


整形と lint は Biome。Prettier と ESLint は使わない。TypeScript は **6 の最新**（いま 6.0.3）。7 は Astro / Svelte の型ツールが追いついてから。

## 文書(各AI著)

`docs/`。GitHub のリポジトリ上の説明。サイトの URL にはしない。`src/pages` にも `public/` にも置かない。


| ファイル                                        | 内容                                          |
| ------------------------------------------- | ------------------------------------------- |
| [企画書.md](docs/企画書.md)                       | 何を作るか。画面と訪問者の流れ                             |
| [概要説明.md](docs/概要説明.md)                     | ファイルの持ち方。pages、partial、データ                  |
| [環境構築.md](docs/環境構築.md)                     | Node、npm、Astro、Biome。入れたものと入れないもの           |
| [デプロイ設定.md](docs/デプロイ設定.md)               | Cloudflare（Workers Builds、R2、ドメイン）          |
| [CATC.md](docs/CATC.md)                     | についての活動（Cultivate A Thinker for Cattyverse） |


## ライセンス

[MIT](LICENSE)