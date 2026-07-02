# マイノベルズ - 小説ブックマーク管理Webアプリ

主にネット小説を管理するための、フルスタックWebアプリケーションです。
ユーザー認証・CRUD操作・検索・フィルタリング機能を備えています。

## 画面イメージ

> 検索画面・小説登録画面・ログイン画面を実装しています。

## 主な機能

- **ユーザー認証**：新規登録・ログイン・ログアウト（bcryptによるパスワードハッシュ化、express-sessionによるセッション管理）
- **小説の管理（CRUD）**：タイトル・URL・タグ・概要・評価（1〜5）・ステータス（完結済／連載中）の登録・編集・削除
- **検索・フィルタリング**：キーワード検索（タイトル・概要・タグ対象）、除外キーワード、並び替え（新着順・評価順）
- **ページネーション**：1ページ20件表示、前後ページ移動
- **アカウントごとのデータ分離**：ログイン中のユーザーの小説のみ表示
- **あらすじの開閉UI**：クリックで展開・折りたたみ可能

## 使用技術

| カテゴリ | 技術 |
|---|---|
| バックエンド | Node.js / Express |
| テンプレートエンジン | EJS |
| データベース | SQLite（better-sqlite3） |
| 認証 | bcrypt / express-session |
| フロントエンド | HTML / CSS / JavaScript（バニラ） |
| ホスティング | Render |
| バージョン管理 | Git / GitHub |

## デモ

ライブデモはこちら: https://syosetu-kiroku-personal-website.onrender.com

デモ用アカウント：
- ユーザーID：`demoBan`
- パスワード：`demo123`
  
## セットアップ（ローカル環境）

```bash
# リポジトリをクローン
git clone https://github.com/sakuraei007/syosetu-kiroku-personal-website.git
cd syosetu-kiroku-personal-website/syousetu-browser

# 依存パッケージをインストール
npm install

# サーバーを起動
node server.js
```

ブラウザで `http://localhost:3000` を開いてください。

## 工夫した点

- 未経験からゼロベースで実装し、フルスタック開発の全工程を経験
- `bcrypt`によるパスワードのハッシュ化など、基本的なセキュリティ対策を実装
- セッション管理により、ページ遷移をまたいだログイン状態の保持を実現
- SQLの`WHERE user_id = ?`条件によるデータの権限分離を実装
- `.gitignore`によるビルド成果物の除外など、デプロイ環境への対応を経験


---

# MyNovels - Light Novel Bookmark Manager

A full-stack web application for managing light novel bookmarks, featuring user authentication, CRUD operations, search, and filtering.

## Features

- **User Authentication**: Registration, login, and logout with bcrypt password hashing and session management via express-session
- **Novel Management (CRUD)**: Create, read, update, and delete entries including title, URL, tags, summary, rating (1–5), and status (Completed / Ongoing)
- **Search & Filtering**: Keyword search across title, summary, and tags; exclude keywords; sort by newest or highest-rated
- **Pagination**: 20 items per page with previous/next navigation
- **Per-account Data Isolation**: Each user only sees their own registered novels
- **Expandable Synopsis UI**: Click to expand/collapse novel summaries

## Tech Stack

| Category | Technology |
|---|---|
| Backend | Node.js / Express |
| Template Engine | EJS |
| Database | SQLite (better-sqlite3) |
| Authentication | bcrypt / express-session |
| Frontend | HTML / CSS / Vanilla JavaScript |
| Hosting | Render |
| Version Control | Git / GitHub |

## Live Demo

Live demo: https://syosetu-kiroku-personal-website.onrender.com

Demo account:
- User ID: `demoBan`
- Password: `demo123`

## Local Setup

```bash
# Clone the repository
git clone https://github.com/sakuraei007/syosetu-kiroku-personal-website.git
cd syosetu-kiroku-personal-website/syousetu-browser

# Install dependencies
npm install

# Start the server
node server.js
```

Open `http://localhost:3000` in your browser.

## Learnings

- Built a full-stack application from scratch with no prior programming experience
- Implemented basic security measures including bcrypt password hashing
- Maintained login state across page transitions using session management
- Enforced per-user data access control using SQL `WHERE user_id = ?` conditions
- Gained hands-on experience with deployment, including `.gitignore` configuration for production environments


