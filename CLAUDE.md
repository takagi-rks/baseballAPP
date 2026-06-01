# Claude Instructions

## 基本方針

* 実務レベルで最短解決できる提案を優先する
* 小さく安全に変更する
* まず調査し、勝手に大規模修正しない
* 修正前に影響範囲を整理する
* 不明点は推測せず、調査結果を明示する
* 変更理由を必ず説明する

---

# 回答ルール

以下の順番で整理する。

1. 結論
2. 根拠
3. 具体的な修正内容
4. 影響範囲
5. リスク・注意点

---

# コード修正ルール

## 必須

* 修正前 / 修正後 を明示
* 差分が分かる形で説明
* 勝手にリファクタリングしない
* 関係ないファイルを触らない
* commitは小さく分ける
* transaction整合性を重視する
* 既存API構造を維持する

---

# 禁止事項

* 勝手な大規模構成変更
* package変更乱発
* DB schema変更を無断実施
* 無意味な抽象化
* 型エラー放置
* console.error削除のみで逃げる対応
* テストなしで大規模変更

---

# 技術スタック

* Next.js App Router
* TypeScript
* PostgreSQL
* Supabase
* Docker Compose
* nginx
* AWS
* Playwright
* Logto

---

# インフラ前提

環境依存の質問では以下を優先前提とする。

* Amazon Linux 2023
* WSL2 Ubuntu
* Docker Compose
* nginx
* AWS EC2

---

# Dockerルール

* compose.yml を優先
* docker compose コマンドを使用
* コンテナ名を明示
* 確認コマンドを必ず含める
* 起動確認方法を含める

---

# DBルール

* transaction不足を常に疑う
* 整合性リスクを説明する
* migration影響を説明する
* N+1や集計負荷を意識する

---

# APIレビュー観点

以下を優先確認する。

* validation不足
* transaction不足
* 認可不足
* 例外処理不足
* timeoutリスク
* 負荷試験時の問題
* DB connection leak

---

# Playwrightルール

* E2E前提で考える
* data-testidを優先
* brittle selectorを避ける
* 並列実行時の競合を考慮する

---

# Gitルール

* 変更前に git status を確認
* commit前に diff を確認
* 小さいcommit単位を優先
* 勝手にpushしない

---

# レビュー形式

レビュー時は以下をセットで提示する。

* 問題内容
* 発生条件
* 影響範囲
* 修正優先度
* 推奨修正

---

# ログ・障害調査

障害対応時は以下を優先順位付きで整理する。

* ログ
* HTTP status
* stacktrace
* container status
* DB状態
* nginx upstream状態

---

# 出力形式

* コピペ可能形式を優先
* コマンドはまとめて提示
* 実行順序を明示
* 確認コマンドを含める
* 想定結果を書く

---

# 現在の優先事項

1. Logto認証追加
2. Docker Compose整備
3. transaction改善
4. Playwright E2E
5. GitHub Actions CI/CD
6. 負荷試験
7. パフォーマンス改善

---

# 作業開始時

まず以下を確認する。

* git status
* git branch
* package.json
* compose.yml
* README
* TODO/FIXME
* .env.example

その後、現在の問題点と次にやるべき作業を整理してから提案する。

---

# 作業ルール

まず調査のみ実施する。

勝手に修正せず、

* 問題点
* 原因
* 修正案
* 影響範囲
  を説明してから変更する。

