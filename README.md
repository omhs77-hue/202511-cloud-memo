# 202511-cloud-memo

Cloudflare Pages で公開できるシンプルな「URL を知っている人向け」メモビューアです。`content.md` に Markdown を貼り付けるだけで、
表やコードブロック、PlantUML を表示できます。Markdown 全体および各コードブロックにコピー ボタンを付けています。

## 使い方
1. `content.md` を開き、共有したい Markdown コンテンツを貼り付けます。
2. Cloudflare Pages にこのリポジトリを接続し、フレームワークとして「静的サイト」、ビルドコマンドと出力ディレクトリはどちらも空欄
（直下のファイルを公開）で設定します。Pages 側でカスタムビルドコマンドとして `npx wrangler deploy` を設定すると、
Worker 前提のコマンド扱いになり `It looks like you've run a Workers-specific command in a Pages project.` で失敗します。
必ず「ビルドコマンドなし」に修正し、必要なら `wrangler pages deploy . --project-name <project>` のように Pages 用コマンドを
明示します（`--assets=.` を付けた `wrangler deploy` でも可ですが、Pages 用の `wrangler pages deploy` が確実です）。
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

### GitHub Secrets / Variables に設定する値
- `CLOUDFLARE_API_TOKEN` : 上記で発行した API トークン（Secret）。
- `CLOUDFLARE_ACCOUNT_ID` : Cloudflare のアカウント ID（Secret）。
- `CLOUDFLARE_PROJECT_NAME` : Cloudflare Pages のプロジェクト名（Repository Variables 推奨）。
 - 既存で `CLOUD_FLARE_PROJECT_NAME` を使っている場合も読み取りますが、今後は `CLOUDFLARE_PROJECT_NAME` を使ってください。
 - GitHub の Settings > Secrets and variables > Actions > Variables で `CLOUDFLARE_PROJECT_NAME` を登録してください。

### 初回デプロイ（Cloudflare 側設定）
1. Cloudflare Pages で新規プロジェクトを作成し、デプロイ元に GitHub のこのリポジトリを接続します。
2. フレームワークプリセットは「なし（静的サイト）」、ビルドコマンドとビルド出力ディレクトリは空欄で保存します。
   - `npx wrangler deploy` のように Worker 用コマンドを指定すると "Missing entry-point" で失敗するため、必ず空欄にしたまま
     保存してください（このリポジトリはビルド不要で、静的ファイル直置きです）。
   - 必要であれば環境変数として `NODE_VERSION=20` などを指定しても問題ありません。
   - `wrangler.json` は Pages 用の `pages_build_output_dir` のみを定義しています。Pages プロジェクトでは `assets` フィールドは
     サポートされないため、追加しないでください（`wrangler deploy` 時のバリデーションエラーを避ける目的です）。
3. 作成後に表示されるプロジェクト名とアカウント ID を GitHub Secrets に設定します。

#### 既存プロジェクトで `wrangler deploy` を指定していて失敗する場合
- Cloudflare Pages の Dashboard で対象プロジェクトを開き、**Settings > Functions** のビルドコマンドが `npx wrangler deploy` になっていないか確認し、空欄に戻してください。
- 同じ画面で Build output directory も空欄にします（静的ファイルをそのまま公開するため）。
- もしコマンドをどうしても設定したい場合は、`wrangler pages deploy . --project-name <project>` を指定します（このリポジトリはビルド工程なしのため、通常は空欄推奨）。

### 自動デプロイの動作
- `main` ブランチに push されると、`.github/workflows/deploy.yml` が `cloudflare/pages-action` を使って自動でデプロイします。
- 手動実行したい場合は、GitHub Actions の画面から `workflow_dispatch` を選んで実行できます。

### 手動アップロードで試す場合（ローカルから）
Cloudflare CLI (`wrangler`) を使えば、ローカルからも同等の設定でデプロイできます。`wrangler.json` と `.wranglerignore` を
同梱しているため、リポジトリ直下をそのまま Pages にアップロードできます。

```bash
# 1) ローカルで wrangler を入れる
npm install --global wrangler

# 2) Pages プロジェクト名とアカウント情報で CLI にログイン
wrangler login

# 3) 静的ファイルを Pages にデプロイ（出力ディレクトリはカレント直下）
wrangler pages deploy . --project-name <project> --branch main
```

## ローカルプレビュー
特別なビルドは不要で、`index.html` をブラウザで直接開けば動作確認できます。
