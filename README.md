````md
# Baseball Scorekeeping App

草野球チーム向けのスコア・個人成績管理アプリです。  
スマホから試合中にリアルタイムで打席結果を入力し、スコアボード・個人成績・OPSランキング・AIコメントを確認できます。

## URL

- Production:
  https://baseball-app.vercel.app

- GitHub:
  https://github.com/takagi-rks/baseballAPP

---

# 主な機能

## 試合管理
- 新規試合作成
- 試合履歴表示
- 試合切り替え
- 対戦相手・球場・メモ管理
- 試合状態管理（試合中 / 終了 / 中止）

## スコア入力
- 打席結果登録
- 打順自動遷移
- ランナー状態管理
- アウトカウント管理
- イニング進行
- スコアボード自動更新

## 個人成績
- 打率
- 出塁率（OBP）
- 長打率（SLG）
- OPS
- 打点
- 安打数
- 打席数

## AIコメント
成績に応じて監督風コメントを自動生成。

例:
- 「今日は長打力と出塁力の両面で素晴らしい内容です」
- 「高い確率でヒットを打てており、打線の中心になっています」

## その他
- Undo（直前入力取り消し）
- CSV出力
- 選手管理
- レスポンシブ対応

---

# 使用技術

## Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS

## Backend
- Next.js API Routes

## Database
- PostgreSQL
- Supabase

## Infrastructure
- Vercel
- GitHub

---

# システム構成

```text
Smart Phone / PC
        ↓
     Vercel
(Next.js App Router)
        ↓
 Next.js API Routes
        ↓
 Supabase PostgreSQL
````

---

# ディレクトリ構成

```text
src/
├ app/
│ ├ api/
│ ├ components/
│ ├ constants/
│ ├ types/
│ └ page.tsx
├ lib/
│ └ db.ts
```

---

# API一覧

| API                      | 内容            |
| ------------------------ | ------------- |
| `/api/games`             | 試合一覧 / 新規試合作成 |
| `/api/games/[id]`        | 試合詳細取得        |
| `/api/players`           | 選手一覧 / 追加     |
| `/api/plate-appearances` | 打席結果登録        |
| `/api/scoreboard`        | スコア取得         |
| `/api/stats/players`     | 個人成績集計        |
| `/api/ai/comments`       | AIコメント生成      |
| `/api/export/stats`      | CSV出力         |

---

# セットアップ

## 1. Clone

```bash
git clone https://github.com/takagi-rks/baseballAPP.git
cd baseballAPP
```

## 2. Install

```bash
npm install
```

## 3. Environment Variables

`.env.local`

```env
DATABASE_URL="YOUR_SUPABASE_DATABASE_URL"
```

## 4. Start

```bash
npm run dev
```

---

# 今後追加したい機能

* ログイン機能
* チーム共有機能
* LINE通知
* PWA対応
* OpenAI API連携
* 投手成績管理
* 守備成績管理
* グラフ分析
* 試合分析AI

---

# 工夫したポイント

## リアルタイム性

試合中でもスマホから片手で入力できるUIを意識しました。

## 実運用を意識した設計

単純なCRUDではなく、以下を実装しています。

* Undo機能
* 試合単位管理
* AIコメント
* スコアボード
* OPS計算
* CSV出力

## 保守性

コンポーネント分割を行い、保守しやすい構成を意識しました。

---

# Author

Takagi

```
```
