# 202511-cloud-memo

Cloudflare Pages で公開できるシンプルな「URL を知っている人向け」メモビューアです。`content.md` に Markdown を貼り付けるだけで、
表やコードブロック、PlantUML を表示できます。Markdown 全体および各コードブロックにコピー ボタンを付けています。

## 使い方
1. `content.md` を開き、共有したい Markdown コンテンツを貼り付けます。
2. Cloudflare Pages にこのリポジトリを接続し、フレームワークとして「静的サイト」、ビルドコマンドと出力ディレクトリはどちらも空欄
（直下のファイルを公開）で設定します。
3. デプロイ後、発行された URL をチームに共有してください。URL を知っているメンバーのみが参照する前提の運用になります。

## 特徴
- Markdown のコピー機能（ページ上部のボタン）。
- コードブロックや PlantUML ブロックに個別のコピー ボタンを付与。
- PlantUML は https://www.plantuml.com/plantuml/svg/ にエンコードして図を描画。
- `markdown-it` によるテーブル等のリッチな Markdown 表示。

## デプロイ手順（Cloudflare Pages + GitHub Actions）
### 事前に準備するもの
- Cloudflare アカウントと、Pages が利用可能なアカウント ID。
- Cloudflare Pages のプロジェクト名（例: `cloud-memo`）。
- API トークン（スコープ: `Account.Cloudflare Pages` / `Edit` 以上）。
  - Cloudflare Dashboard > My Profile > API Tokens から作成可能です。

### GitHub Secrets に設定する値
- `CLOUDFLARE_API_TOKEN` : 上記で発行した API トークン。
- `CLOUDFLARE_ACCOUNT_ID` : Cloudflare のアカウント ID。
- `CLOUDFLARE_PAGES_PROJECT_NAME` : Cloudflare Pages プロジェクト名。

### 初回デプロイ（Cloudflare 側設定）
1. Cloudflare Pages で新規プロジェクトを作成し、デプロイ元に GitHub のこのリポジトリを接続します。
2. フレームワークプリセットは「なし（静的サイト）」、ビルドコマンドとビルド出力ディレクトリは空欄で保存します。
   - 必要であれば環境変数として `NODE_VERSION=20` などを指定しても問題ありません（本プロジェクトはビルド不要）。
3. 作成後に表示されるプロジェクト名とアカウント ID を GitHub Secrets に設定します。

### 自動デプロイの動作
- `main` ブランチに push されると、`.github/workflows/deploy.yml` が `cloudflare/pages-action` を使って自動でデプロイします。
- 手動実行したい場合は、GitHub Actions の画面から `workflow_dispatch` を選んで実行できます。

### 手動アップロードで試す場合（ローカルから）
Cloudflare CLI (`wrangler`) を使えば、ローカルからも同等の設定でデプロイできます。

```bash
npm create cloudflare@latest -- --project-name <project> --site .
# または `wrangler pages deploy . --project-name <project> --branch main`
```

## ローカルプレビュー
特別なビルドは不要で、`index.html` をブラウザで直接開けば動作確認できます。
