# development — Project Roots

このドキュメントは Project Roots における **開発フローの共通ルール** を定義する。  
特に、GPT-5.1 / Codex（Cursor 等）と組んで開発を進める際の標準パターンをまとめる。

- 「どこから手を付ければいいか」
- 「どのドキュメントを LLM に読ませればいいか」
- 「長時間タスクをどう ExecPlan で管理するか」

をここで決める。

---

## 0. 前提

### 0.1 リポジトリ構成

ルート構造とバックエンド/インフラの詳細は `docs/architecture.md` を参照。  
DDD（レイヤー構造・Entity/VO/Repository など）は `docs/ddd/**` に定義済み。

このファイルはそれらを前提に「どう開発を進めるか」に集中する。

### 0.2 ツール前提

- エディタ: Cursor / VSCode など（GPT-5.1-codex 利用を想定）
- ターミナル: 任意（Codex の shell 実行が使えると便利）
- Docker: ローカル開発・VPS ともに使用
- LLM: ChatGPT / Cursor の両方を想定

---

## 1. 開発の基本フロー（人間視点）

### 1.1 新しいタスクを始めるとき

1. **対象を決める**
   - apps/<app>/backend なのか
   - apps/<app>/frontend なのか
   - base/<service>/backend なのか

2. **関連ドキュメントを読む**
   - 全体像: `docs/architecture.md`
   - DDDルール: `docs/ddd/index.md` と `docs/ddd/layers/overview.md`
   - 対象アプリ固有の docs（例：`apps/{app_name}/docs/overview.md`）

3. **タスクを一言で言語化する**
   - 例: 「MakotoClub の店舗一覧APIを追加する」
   - 例: 「base/auth の JWT リフレッシュトークン実装を追加する」

4. **タスクの粒度を確認する**
   - 「数時間〜半日」以上かかりそう → ExecPlan を使う
   - 「1〜2コミットで終わる小さな修正」 → 直接作業でOK（ただし簡単なメモは `docs/DEVLOG/` に残してもよい）

---

## 2. ExecPlan ベースの開発（長時間タスク向け）

OpenAI Cookbook の `PLANS.md / ExecPlan` の考え方を Roots 用にアレンジして使う。

### 2.1 ExecPlan を使うべきタスク

- 複数ファイル・複数レイヤーにまたがる実装
- 既存の base-services からの大きなリファクタリング
- 新しいサービス（例: base/<service>）の立ち上げ
- 1日以上かかりそうな作業

### 2.2 ExecPlan の場所と命名（Roots のルール）

ExecPlan は **`docs/DEVLOG/` 配下に 1タスク1ファイル** で置く。

推奨命名：

```txt
docs/DEVLOG/
  2025-11-29_base-auth-refactor.md
  2025-12-01_makotoclub-store-api.md
  ...
```

- 日付 + 短い英語 or スネークケース説明
- 日本語タイトルはファイルの # 見出しで書く

LLM に何かさせるときは、**必ず該当 ExecPlan を最初に読み込ませる**。

---

## 3. ExecPlan スケルトン（Roots版）

新しい ExecPlan を作るときは、必ずこのテンプレートから始める。

```md
# <Short, action-oriented description>

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的:
- 完了するとユーザー/システム視点で何ができるようになるか:
- 動作確認のイメージ（URL / コマンド etc）:

## Progress

作業の進捗をチェックボックスで管理する。  
**手を止めたポイントは必ずここに反映する。**

- [ ] (YYYY-MM-DD hh:mm) 既存コード・docs の調査完了
- [ ] (YYYY-MM-DD hh:mm) DDD観点での設計方針を固める
- [ ] (YYYY-MM-DD hh:mm) domain 層の実装
- [ ] (YYYY-MM-DD hh:mm) usecase 層の実装
- [ ] (YYYY-MM-DD hh:mm) adapter 層の実装（HTTPなど）
- [ ] (YYYY-MM-DD hh:mm) infra 層の実装（DB, 外部API）
- [ ] (YYYY-MM-DD hh:mm) テスト & 動作確認
- [ ] (YYYY-MM-DD hh:mm) リファクタリング & 後片付け

必要に応じて粒度を細かく/粗く調整する。

## Surprises & Discoveries

実装中に発見した「想定外」をメモしていく。

- Observation: ...
  - Evidence: ...
  - Files: ...

例：
- Observation: 旧 base-services の auth で想定外のエラー処理がいたるところに散っている
  - Evidence: `<path/to/file>` の `<function>` 内で…
  - Files: ...

## Decision Log

重要な設計判断はすべてここに記録する。

- Decision: ...
  - Rationale: ...
  - Date/Author: ...

例：
- Decision: auth のトークン生成ロジックは domain ではなく usecase に置く
  - Rationale: 認証プロトコルに強く依存し、アプリケーションルールに近いため
  - Date/Author: 2025-11-29 / taiichi

## Outcomes & Retrospective

タスク完了（または区切り）時に、結果・残課題・学びをまとめる。

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

このタスクに関係する現在の状態を、何も知らない人向けに説明する。

- 対象アプリ / サービス: (例: base/auth)
- 関連する主要ディレクトリ:
  - `base/auth/backend/domain/...`
  - `base/auth/backend/usecase/...`
  - `base/auth/backend/adapter/...`
  - `base/auth/backend/infra/...`
- 関係する docs:
  - `docs/architecture.md` のどの章か
  - `docs/ddd/...` のどのファイルか

ここは「LLM に渡すときの前提説明」にもなる。

## Plan of Work

どういう順番でコードを書き換えるか、散文で書く。

- 既存 base-services のソース確認
- `base/auth/backend` のディレクトリ作成
- domain 層の Entity/VO/Repository IF を設計
- usecase 層でユースケースを定義
- adapter 層で HTTP ハンドラを実装
- infra 層で DB 永続化を実装
- テスト & 動作確認

各ステップで「どのファイルのどの関数を触るか」まで具体的に書けるとベスト。

## Concrete Steps

実際に実行するコマンド群をここに書く。

- 作業ディレクトリ:
  - `roots/` または `roots/base/auth/backend` など

例：

- `cd roots`
- `ls`
- `cd base/auth/backend`
- `go test ./...`
- `cd ../../../infra/docker/base`
- `docker compose -f compose.local.yml up -d`

Codex に shell を撃たせるときも、**このセクションを更新してから実行させる。**

## Validation and Acceptance

検証方法と合格条件を定義する。

- 起動方法:
  - `docker compose ...`
  - `go run ./cmd/api`
- 確認方法:
  - `curl http://localhost:8080/...`
- 期待するレスポンス or 振る舞い:

「何をしたら “終わり” とみなすか」を必ず明文化する。

## Idempotence and Recovery

- この ExecPlan のステップは再実行しても安全か？
- 失敗したとき、どこまで戻ればクリーンにやり直せるか？
  - 例：`git reset --hard HEAD~1`
  - 例：`docker compose down -v && docker volume rm ...`

## Artifacts and Notes

- 作成したファイル/ディレクトリ一覧
- 関連する Issue やチケット
- 参考にしたリンク
```

---

## 4. Codex / LLM と ExecPlan の連携パターン

### 4.1 典型的な使い方（Codex にやらせる流れ）

1. `docs/DEVLOG/...ExecPlan` を開く
2. Codex に以下を渡す：

   - `docs/architecture.md`
   - 関連する `docs/ddd/**`
   - 今開いている ExecPlan ファイル

3. プロンプト例：

   > この ExecPlan と docs/architecture.md, docs/ddd/** に従って、  
   > 次にやるべき具体的な編集内容と実行コマンドを `Concrete Steps` セクションに追記し、  
   > その後、必要なファイル編集とコマンド実行を順番に進めてください。  
   > 作業のたびに `Progress` と `Decision Log` を更新してください。

4. Codex に任せるが、「よくわからない変更」「危険そうなコマンド」が出たら止める。
5. 途中で方針を変えたくなったら、まず ExecPlan の
   - `Decision Log`
   - `Progress`
   を更新してから、改めて Codex に指示する。

### 4.2 人間側の役割

- ExecPlan の骨格と大きな流れを決めるのは人間
- Codex には
  - 下調べ
  - 具体的な編集
  - コマンド実行
を任せるイメージ。

「設計ごと丸投げ」ではなく、  
**ExecPlan を通じて “設計を握り続ける” のが人間の責務**。

---

## 5. 小さなタスクの扱い

すべてのタスクに ExecPlan を書くとオーバーヘッドになるので、小さな修正は以下でよい。

- `docs/DEVLOG/` に 1日1ファイル程度の簡単なメモ
- コミットメッセージを丁寧に書く
- 必要になったときだけ改めて ExecPlan を切り出す

目安：

- 「1〜2コミット」「1〜2時間以内」で終わる → ExecPlan なしでもOK
- それ以上になりそう → 最初に ExecPlan を切った方が、結果的に速くて安全

---

## 6. 今後の拡張

- アプリごとの `apps/<app>/docs/development.md` に、  
  ローカル起動・テスト・フロントエンドの起動手順を追加する。
- base サービスごとの `base/<service>/docs/development.md` も同様。
- CI/CD（GitHub Actions 等）を導入したら、  
  ここに「CI が前提とする前提条件」も追記する。

---

この `docs/development.md` は、  
Roots で開発するときの「人間 + LLM の共通ルール」として扱う。  
迷ったときはここに立ち返り、足りないと感じたらまずこのファイルを更新すること。

---

## 7. テスト運用の必須リファレンス

- テストを書く/改修するときは **必ず `docs/test_strategy.md` を参照** する。
  - どのレイヤーをどの粒度でテストするか
  - テーブル駆動テストの必須範囲
  - LLM にテスト生成を任せるときの指示テンプレ
- ExecPlan やタスク開始時に、対象コードと併せて `docs/test_strategy.md` を必ず読み込ませる。

---

## 7. コーディング共通ルール（コメント / GoDoc）

- Go の公開シンボル（パッケージ、関数、メソッド、struct/インタフェース/フィールド、変数/定数）は `godoc` 形式のコメントを必須とする。  
  - 形式: `// Name ...` で始め、1文目で役割を簡潔に説明する。  
  - できるだけ平易な日本語か英語で「何をするか」「いつ使うか」を書く。
- 非公開シンボルでも、挙動が直感的でないもの（副作用、トリッキーなロジック、外部仕様に依存する処理など）はコメントを付ける。
- 既存コードでコメントが欠けている場合、新規変更時に気づいた範囲で追記する（差分範囲で構わない）。
- コメントのない公開シンボルを新規で追加するのは禁止（レビューで弾く）。
