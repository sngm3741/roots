全て日本語で答えてください。


----


これからは、ただ同意するのではなく、私に対して率直で本質的な助言者として行動してほしい。
お世辞も慰めもいらない。遠慮せず、真実をそのまま伝えてほしい。
私の考えを徹底的に検証し、前提を問い直し、見落としている盲点を指摘してほしい。
感情ではなく、論理的で客観的に。包み隠さず、フィルターをかけずに話してほしい。

もし私の論理が弱いなら、その理由を明確に示して。
自分を甘やかしたり、都合よく解釈しているなら、それを正直に指摘して。
不快な現実から逃げていたり、時間を無駄にしているなら、それをはっきり伝え、どんな機会を失っているのかを説明して。

私の状況を、完全な客観性と戦略的な視点から見て、どこで言い訳をしているのか、どこで小さくまとまっているのか、あるいはリスクや努力を過小評価しているのかを明らかにしてほしい。
そのうえで、次の段階に進むために変えるべき思考・行動・姿勢を、具体的かつ優先順位をつけて提案してほしい。

遠慮せず、本音で。
私は慰めではなく、成長のために真実を聞きたい。
だから、あなたには「私の成長に本気で関わるアドバイザー」として接してほしい。

そして、可能な限り、私の言葉の奥にある「本当の意図」や「まだ言語化できていない真実」を感じ取りながら答えてほしい。

口調はSっ気があるけど優しさのある年上のお姉さん的な感じで。
あと俺の名前は「太一」ね。継承はくん付けで。


-----


# agents.md — LLM / Agent 運用ルール（Project Roots）

このドキュメントは、Project Roots において  
**LLM（ChatGPT / Cursor Codex などの「エージェント」）に作業を任せるときの共通ルール** を定義する。

- どのドキュメントを必ず読ませるか
- どういう順番で作業させるか
- 何を「絶対にやらせてはいけないか」

をここで一本化する。

人間も LLM も、**設計判断に迷ったらまずこのファイルに立ち返ること。**

---

## 1. エージェントに必ず読ませるドキュメント

### 1.1 グローバル設計

- `docs/architecture.md`  
  → ルート構造（apps/base/infra/docs）の全体像・役割。
- `docs/development.md`  
  → 開発フロー / ExecPlan（ExecPlan = docs/DEVLOG/**）の運用ルール。
- `docs/test_strategy.md`  
  → テスト方針（単体 / 結合 / E2E の粒度と優先度）。

### 1.2 DDD / レイヤールール

- `docs/ddd/index.md`
- `docs/ddd/layers/overview.md`
- `docs/ddd/layers/domain.md`
- `docs/ddd/layers/usecase.md`
- `docs/ddd/layers/adapter.md`
- `docs/ddd/layers/infra.md`
- `docs/ddd/modeling/entity.md`
- `docs/ddd/modeling/value-object.md`
- `docs/ddd/modeling/aggregate.md`
- `docs/ddd/modeling/repository.md`
- `docs/ddd/modeling/domain-service.md`
- `docs/ddd/rules/data-access.md`

### 1.3 Config / インフラ

- `docs/config_rules.md`  
  → .env / Config の扱い。env を「どの層で読んでいいか」の唯一の正解。
- `infra/configs/templates/**`  
  → .env のテンプレ配置。どのサービスが何のキーを必要とするか。

---

## 2. 共通原則（絶対ルール）

エージェントに守らせるべき共通原則：

1. **まず「理解」→ 次に「編集」**  
   - いきなりコードを書かず、必ず「どのファイルをどう変えるか」を文章で説明させる。
2. **DDD / レイヤールールから逸脱しない**  
   - domain/usecase/adapter/infra の責務を、`docs/ddd/**` に沿って配置させる。
3. **env を domain/usecase で直接読ませない**  
   - `os.Getenv` などは `cmd` or `infra` に限定（config_rules.md を遵守）。
4. **大きな変更は必ず ExecPlan（docs/DEVLOG/**）に紐づける**  
   - 1〜2 コミットで終わらない作業は、専用の ExecPlan を作ってから着手させる。
5. **一度に触るファイル数を絞る**  
   - 「とりあえず一括リライト」は禁止。1〜数ファイル単位で編集 + ビルド/テスト。
6. **設計判断は Decision Log に残させる**  
   - ExecPlan の `Decision Log` を更新させ、後から追跡できるようにする。

---

## 3. 標準ワークフロー（エージェントにやらせる手順）

### 3.1 人間側の前準備

1. **タスクを 1 行で定義する**

   例：
   - 「旧 base-services の auth-line を新構造に移植する」
   - 「MakotoClub に店舗一覧の検索 API を追加する」

2. **スコープを決める**
   - 触るのは `base/auth/backend` だけか？
   - `apps/makotoclub/backend` だけか？
   - `infra/docker` も含むか？

3. **タスクが大きい場合は ExecPlan を作る**
   - `docs/DEVLOG/2025-11-29_base-refactor.md` など
   - テンプレは `docs/development.md` を参照

### 3.2 エージェントへの最初の指示（共通パターン）

たとえばこういう形で指示する：

> 1. 次のファイルを読んで、このリポジトリの前提を理解して：  
>    - docs/architecture.md  
>    - docs/development.md  
>    - docs/ddd/index.md  
>    - docs/ddd/layers/overview.md  
>    - docs/config_rules.md  
>    - （今回のタスクに関係する）docs/DEVLOG/20xx-xx-xx_xxx.md  
> 2. 読み終わったら、「理解した内容の要約」と「今回のタスクのための作業プラン（ステップ一覧）」だけをまず出して。  
> 3. そのあと、1ステップずつ、どのファイルをどう変えるか説明してから編集に進んで。

ポイント：

- **「まず要約・プランだけ出せ」と明示する**ことで、いきなり大規模編集を防ぐ。
- docs/ を読ませる優先順位を毎回明示する。

---

## 4. DEVLOG / ExecPlan の使わせ方

### 4.1 エージェントにやらせたいこと

- Progress / Surprises & Discoveries / Decision Log / Outcomes を  
  **タスクの進行に応じて更新させる**。

### 4.2 指示テンプレ

> 今回のタスクの ExecPlan は `docs/DEVLOG/2025-11-29_base-refactor.md` に書いてある。  
> まずこの ExecPlan を読み、`Purpose / Context / Plan of Work` を要約して。  
> そのあと、`Progress` / `Decision Log` を更新しながら作業を進めてほしい。  
> 変更を行う前に、必ず  
> - どのステップを進めるのか  
> - どのファイルを編集するのか  
> を ExecPlan に対応づけて説明してから編集して。

---

## 5. base-services リファクタ専用ルール

`__before/base-services` の再構築は影響範囲が大きいため、  
**必ず専用の ExecPlan を通してエージェントを制御する。**

### 5.1 参照すべき ExecPlan

- `docs/DEVLOG/2025-11-29_base-refactor.md`  
  （例：実際の日付・ファイル名に合わせる）

ここには：

- 対象範囲（Phase 1 は auth-line のみ）
- 旧 → 新のマッピング方針
- 新しい base/auth/backend のディレクトリ構造
- Acceptance Criteria（go build / ローカル起動）

が定義されている。

### 5.2 エージェントへの開始プロンプト例（base リファクタ用）

> 旧 `__before/base-services/auth-service/auth-line` を、  
> Project Roots の新しいアーキテクチャ / DDD ルールに沿って  
> `base/auth/backend` に移植してほしい。  
>  
> まず、次のファイルを読んで理解して：  
> - docs/architecture.md  
> - docs/development.md  
> - docs/config_rules.md  
> - docs/ddd/index.md  
> - docs/ddd/layers/overview.md  
> - docs/ddd/layers/domain.md  
> - docs/ddd/layers/usecase.md  
> - docs/ddd/layers/adapter.md  
> - docs/ddd/layers/infra.md  
> - docs/ddd/modeling/entity.md  
> - docs/ddd/modeling/value-object.md  
> - docs/ddd/modeling/aggregate.md  
> - docs/ddd/modeling/repository.md  
> - docs/ddd/modeling/domain-service.md  
> - docs/ddd/rules/data-access.md  
> - docs/DEVLOG/2025-11-29_base-refactor.md  
>  
> 読み終わったら、  
> 1. リポジトリ全体の構造とルールの要約  
> 2. auth-line 移植タスクのゴールと制約の要約  
> 3. 旧コードからどのファイルをどのレイヤーにマッピングするかの案  
> をまず出してから、編集に進んで。

---

## 6. やらせてはいけないこと（禁則事項）

エージェントには、次を明示的に禁止する：

1. **ドキュメント無視でのコード生成**
   - docs/architecture.md / docs/ddd/** / docs/config_rules.md を読まずに  
     「なんとなくそれっぽい構造」でコードを生やすことを禁止。
2. **domain / usecase からの直接 env 読み取り**
   - `os.Getenv`, `.env` ロードを domain/usecase から行うことは禁止。
3. **一括リライト**
   - 多数ファイルの同時編集・大量リネームを一度に行うことを禁止。
4. **仕様変更を伴うリファクタ**
   - 「挙動が変わるかもしれないリファクタ」は、  
     必ず人間がレビューしてからにする。
5. **docs の勝手な書き換え**
   - architecture / ddd / config_rules などのコアドキュメントを  
     勝手に変更させない（変更が必要な場合は、人間の判断で編集）。

---

## 7. agents.md の使い方（人間の運用）

1. **新しいエージェント作業を始める前に、自分で agents.md を読み直す。**
2. タスクに応じて、
   - どの docs を先に渡すか
   - どの ExecPlan を参照させるか  
   をこのファイルを見ながら決める。
3. エージェントに最初に渡すメッセージの中で：
   - 「参照すべき docs 一覧」
   - 「読んだあとに何を出すか（要約・計画）」
   - 「禁則事項」  
   を毎回明示する。

---

## 8. 今後の拡張

- apps ごとの開発ガイドを  
  `apps/<app>/docs/agents.md` に分割してもよい。
- CI/CD 向けのエージェント（テスト自動化・デプロイスクリプト生成）用の  
  専用セクションを追加する余地がある。
- 実運用で「エージェントにやらせて失敗したパターン」が見つかったら、  
  その都度このファイルに「禁止パターン」として追記する。

---

この `docs/agents.md` 自体は、  
「人間がエージェントをどうコントロールするか」を決める中枢ドキュメント。  
エージェントに仕事を投げる前に、必ずここを起点にプロンプトを組み立てること。

