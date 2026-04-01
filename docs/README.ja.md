# C-commerce フロントエンド

[한국어](./README.ko.md) | [English](../README.md) | [日本語](./README.ja.md)

Next.js App Router で構築した、賞味期限・消費期限が近い特価商品向けのモバイルファーストなコマースフロントエンドです。

このリポジトリには以下が含まれます。

- 探索、商品詳細、カート、通知、注文、アカウントまでの購入者フロー
- 商品登録とダッシュボード管理のための販売者フロー
- 認証、商品、カート、注文、通知、販売者 API を包む BFF スタイルのルートハンドラー
- Tailwind CSS、Framer Motion、Lucide、Zustand によるモバイルアプリ風 UI

## 技術スタック

- Next.js 16.2.1
- React 19
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Zustand
- Vitest
- Playwright

## 主な機能

- `(store)` / `(auth)` ルートグループを使った App Router 構成
- 単一 `accessToken` の HttpOnly Cookie セッション処理
- フィルターとスクロール位置の復元に対応した無限スクロールの探索フィード
- 内部 BFF ルートによる購入者 / 販売者ロール分離フロー
- モバイルアプリのビューポートを基準に設計した商品、カート、通知、注文画面
- 動的なファビコンと Open Graph 画像生成

## 主なルート

ユーザー向けの主要ルート:

- `/`
- `/explore`
- `/products/[id]`
- `/alerts`
- `/cart`
- `/orders/[id]/success`
- `/account`
- `/login`
- `/signup`
- `/signup/terms/[termKey]`
- `/seller`
- `/seller/products/new`

内部 API は `/api/*` 配下にあり、バックエンド API をプロキシしながらセッション処理を統一します。

## 環境変数

`.env.example` を元にローカル環境ファイルを作成します。

```bash
cp .env.example .env.local
```

開発では推奨、デプロイ環境では必須の変数:

```env
API_BASE_URL=http://localhost:8080
```

## はじめ方

依存関係のインストール:

```bash
corepack enable
pnpm install
```

開発サーバーの起動:

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) を開いて確認します。

## スクリプト

```bash
pnpm dev         # Next.js 開発サーバーを起動
pnpm build       # 本番ビルド
pnpm start       # 本番サーバーを起動
pnpm lint        # ESLint を実行
pnpm test        # Vitest のユニットテストを実行
pnpm test:e2e    # Playwright の E2E テストを実行
```

開発中に webpack ベースでビルド確認する場合:

```bash
pnpm build -- --webpack
```

## テスト

ユニットテストでは、ユーティリティ、認証 / セッションヘルパー、コマースデータの挙動を確認します。

```bash
pnpm test
```

E2E テストでは、公開ナビゲーション、探索フィルター動作、ビジュアルレビュースナップショットを確認します。

```bash
pnpm exec playwright test
```

このリポジトリの標準パッケージマネージャーは `pnpm` です。`npm` と `pnpm` の lockfile は混在させません。

## プロジェクトメモ

- UI は中央固定のモバイルアプリフレーム内に収まるよう設計されています。
- Explore 画面はページネーションではなく無限スクロールを使用します。
- ドキュメント準拠の商品一覧 API と、無限スクロール用フィード API を内部的に分けて、契約整合性とアプリ UX を両立しています。
- 公式サービスロゴは `/logo/c-commerce.png` を使用します。
