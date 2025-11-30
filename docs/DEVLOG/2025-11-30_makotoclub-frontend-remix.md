# MakotoClub frontend Next.js→Remix 移植プロンプト

この ExecPlan は、`__before/makoto-club` にある Next.js フロントエンドを Remix へ書き換えるために Codex（GPT-5.1-codex 等）へ与えるプロンプトをまとめる。作業開始時にここからプロンプトをコピーし、必要に応じて進捗欄などを更新すること。

## Purpose / Big Picture

- 目的: MakotoClub フロントエンドを Next.js から Remix へ移行し、`apps/makotoclub/frontend` に新構成を整備する。
- 完了状態: Remix プロジェクトが起動し、既存機能（画面遷移/API コール/認証フローなど）が Next.js 版と同等に動く。
- 動作確認のイメージ: `npm run dev` で Remix サーバーが立ち上がり、主要ページがエラーなく表示される。

## Context and Orientation

- 現行コード: `__before/makoto-club`（Next.js ベース、pages/ ルーティング想定）
- 目標ディレクトリ: `apps/makotoclub/frontend`（Remix ランタイムの標準構成に従う）
- 参照ドキュメント:
  - `docs/architecture.md`（apps ディレクトリの構造規約）
  - `docs/development.md`（開発フロー、LLM への指示テンプレ）
  - 必要に応じて Next.js→Remix の差分整理（データフェッチ/ルーティング/サーバーコンポーネント相当）

## Plan of Work（骨子）

- 既存 Next.js プロジェクトの構成と依存を調査（ルーティング、API 呼び出し、認証、環境変数、スタイル）。
- Remix プロジェクトの初期化（TypeScript 設定、lint/test の雛形まで）。
- ルーティングを Remix の file-based routes へマッピングし直す。
- データロードを `loader` / `action` へ移行し、クライアントフェッチ依存を最小化。
- 認証・セッション・環境変数の扱いを Remix 流儀に再設計（server/client の分離、`.env` 読み込み位置の確認）。
- UI コンポーネント／スタイル（CSS, Tailwind 等）が動作するようビルド設定を移設。
- 動作確認と差分チェック（主要ページ・フォーム・API インタラクション）。

## Prompt (Codex に渡す文章)

```
あなたは GPT-5.1-codex として、Project Roots のルールに従い「MakotoClub」フロントエンドを Next.js から Remix に移植します。以下を厳守してください。

# 事前に読むもの
- `docs/architecture.md`：apps 配下の構造・命名規約。
- `docs/development.md`：LLM への指示フロー。まず理解→次に編集の順を守る。
- 現行コード: `__before/makoto-club` の Next.js プロジェクト一式。

# スコープ / ゴール
- 目標ディレクトリは `apps/makotoclub/frontend`。
- Remix プロジェクトを新規作成し、Next.js 版の画面・機能・API 連携・認証フローを等価に再現すること。
- pages/ ルーティングを Remix の routes/ へマッピングし、`loader` / `action` を活用してデータロード/ミューテーションを実装する。

# 作業方針
1. まず Next.js 側のルーティング・データ取得・認証・環境変数・スタイルを読み解き、移植対象を箇条書きで整理する（何も編集せずに要約を出す）。
2. Remix のベースを `apps/makotoclub/frontend` に初期化し、TypeScript/ESLint/テストの雛形を用意する。
3. ルートごとに Next.js の機能を Remix へ移植：
   - ページ → `app/routes` 配下へ変換（動的ルートは `$param` 形式）。
   - `getServerSideProps` / `getStaticProps` 相当は `loader` へ、フォーム/ミューテーションは `action` へ移行。
   - API 呼び出しは Remix の `fetch`/`defer` などを活用し、サーバーサイドでデータを集約。
4. 認証・セッションがある場合は Remix の request/response を使った実装に置き換え、クッキー設定やリダイレクトを確認する。
5. スタイルやコンポーネントライブラリ（Tailwind, CSS Modules など）が動くように設定を移植。Next.js 固有の設定（Image, Head 等）は Remix 流に適合させる。
6. `.env` 取り扱いと `package.json` scripts を整理し、開発サーバー/ビルド/テストが動くことを確認する。

# 納品物
- 変更ファイル一覧と要約。
- 動作確認手順（`npm run dev` など）。
- もし Next.js 特有機能で移植判断が必要なら Decision Log を追記して報告。

# 禁則・注意
- 無断で仕様を変えない。既存挙動が不明な場合は TODO コメントと調査メモを残す。
- 大量ファイルの無計画な生成を避け、ルート単位で小刻みにコミットできるよう整理。
- 例外処理は必要最低限で、import を try/catch で囲まない。
```

## Progress

- [ ] (2025-11-30 00:00) Next.js コードの調査完了
- [ ] (2025-11-30 00:00) Remix 初期化と基本設定
- [ ] (2025-11-30 00:00) 主要ルートの移植
- [ ] (2025-11-30 00:00) 認証/セッション移設
- [ ] (2025-11-30 00:00) スタイル・ビルド設定の移植
- [ ] (2025-11-30 00:00) 動作確認・テスト
- [ ] (2025-11-30 00:00) 残課題整理

## Surprises & Discoveries

- Observation: 
  - Evidence: 
  - Files: 

## Decision Log

- Decision: 
  - Rationale: 
  - Date/Author: 

## Outcomes & Retrospective

- Achieved: 
- Remaining: 
- Lessons: 
