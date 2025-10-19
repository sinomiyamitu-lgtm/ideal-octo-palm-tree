# 機能一覧（Portfolio サイト）

このドキュメントは、閲覧・編集・オフライン閲覧の各モードで提供している機能を一覧でまとめたものです。運用・保守、仕様確認にご利用ください。

## サイト概要
- シングルページ構成（React + Vite）
- ルーティング：`/`（閲覧モード）、`/edit`（編集モード・認証ゲートあり）
- データ保存：ブラウザ `localStorage` に自動保存（作品・プロフィール・認証状態）
- オフライン閲覧：編集内容を単一HTMLまたはJSONにエクスポート可能

## 閲覧モード（/）
- 作品カード一覧表示（グリッド）
- カード詳細モーダル（「もっと見る」）
  - サムネイル表示または動画埋め込み（YouTube / Vimeo 自動判定）
  - タグ表示（`#タグ`）
  - サブ説明／詳細説明の表示
  - 添付ファイル一覧（ダウンロード可：`data:`URLも対応）
- プロフィール表示
  - 表示名／紹介文／アバター（画像）
  - SNSリンク（X / Roblox / GitHub / YouTube / TikTok / Link）
- 演出・UI
  - 初期表示の入場アニメーション（`ready` 付与でカードが段階的に表示）
  - サムネイルのホバー拡大・影演出
  - グローバルロード画面（起動直後にスピナー表示→自動フェードアウト）

関連ファイル：
- `src/pages/Home.jsx`（画面構成・モーダル起動）
- `src/components/ProjectModal.jsx`（詳細モーダル）
- `src/styles/global.css`（グリッド、カード、モーダル、ロード画面などのスタイル）

## 編集モード（/edit）
- 認証ゲートを通過後に編集UIを表示
- 作品カードの編集
  - タイトル、タグ、サブ説明、詳細説明の編集
  - サムネイル画像（URL入力）
  - 動画URL（YouTube / Vimeo）
  - 添付ファイルの追加（複数、モーダル内にダウンロードリンクとして表示）
- 並び替え
  - ドラッグ＆ドロップ（Dnd Kit）でカード順序を変更（即時保存）
- プロフィール編集
  - 表示名、紹介文、アバター（URLまたは画像）、SNSリンク
- エクスポート
  - 単一HTML（`viewer.html`）
  - JSON（`viewer-data.json`）
- 演出・UI
  - 編集リストの入場アニメーション（インデックスに応じた遅延）

関連ファイル：
- `src/pages/Edit.jsx`（編集ページの構成。戻る／ログアウト）
- `src/components/editor/BlockPalette.jsx`（カード追加）
- `src/components/editor/CardList.jsx`（D&D並び替え・入場演出）
- `src/components/editor/CardForm.jsx`（選択カードの編集フォーム）
- `src/components/editor/ProfileForm.jsx`（プロフィール編集）
- `src/components/editor/ExportPanel.jsx`（エクスポート）

## オフライン閲覧（単一HTMLエクスポート）
- 出力内容
  - `viewer.html`：プロフィール・作品一覧・詳細モーダル・添付ダウンロードを含む単一ファイル
  - `viewer-data.json`：プロフィール・作品のJSON（再利用用）
- ロード画面（シンプル版）
  - 起動直後にスピナーを表示し、短時間で自動フェードアウト
  - 粒子演出は削除（軽量表示に注力）
- 動画埋め込み
  - YouTube / Vimeo を自動判定し `<iframe>` を生成（`allowfullscreen` 対応）

関連ファイル：
- `src/components/editor/ExportPanel.jsx`（オフラインHTMLのテンプレート生成）

## データ保存・キー
- 作品：`localStorage` キー `portfolio_projects`
- プロフィール：`localStorage` キー `portfolio_profile`
- 認証セッション：TTL管理（`VITE_AUTH_TTL_MIN` 分）、永続保存なし

## 認証・ルーティング
- 認証方式：ログインID＋パスワード認証（既定値 `admin` / `1234`）
- 設定場所：`.env` の `VITE_EDIT_USER` / `VITE_EDIT_PASSWORD` または `src/config/auth.json` の `editUser` / `editPassword`
- ルーティング：`react-router-dom`（`/` と `/edit`、未認証時はゲート表示）
- セッション：TTL `VITE_AUTH_TTL_MIN` 分（既定15分）、連続5回失敗で10分ロック

## 演出・アニメーション
- 入場アニメーション：`body.ready` クラスでカードを段階的に表示
- ホバー演出：カード／サムネイルの軽量な拡大・影
- ロード画面：オンライン／オフラインともにスピナー表示→フェードアウト

## アクセシビリティ
- モーダル：`role="dialog"`／`aria-modal="true"` を付与
- スピナー：`role="status"`／`aria-label="読み込み中"` を付与
- 画像：`alt` 属性の付与（オフラインHTMLではサムネイルに代替要素あり）

## 既知の制限・注意
- `localStorage` の容量制限により、非常に大きい添付ファイルは保存できない場合があります
- 外部動画／画像URLは、ホスト側の制約により表示できない可能性があります
- パスワードは `.env` / `auth.json` の設定に依存します。運用時は十分に管理してください

## 進捗一覧（検索・モーダル・ToDo閲覧）
- 機能
  - 進捗カードの検索UI（入力、ステータス選択、タグバー、クリア、サジェスト）
  - カード一覧（ステータス／タグ／クエリでフィルタ）
  - 詳細モーダル（タイトル／タグ／作成・更新日／説明／添付、ToDo閲覧）
- オフライン閲覧（`viewer.html`）
  - 上記の進捗UIとモーダルを単一HTMLに同梱。ブラウザで直接開いてオフライン閲覧可能
- エクスポートpayload（`viewer.html` / `viewer-data.json`）
  - `projects` / `profile` に加えて `progress` を含みます
  - 項目例：`id`, `title`, `status`, `tags[]`, `descriptionShort`, `descriptionFull`, `todos[]`, `attachments[]`, `createdAt`, `updatedAt`
- 関連ファイル
  - `src/components/editor/ExportPanel.jsx`（テンプレート＆ダウンロード処理）
  - `src/store/progress.js`（進捗データ・Zustandストア）

## 参考ドキュメント
- `docs/user-guide.md`：操作手順をわかりやすくまとめたユーザー向けガイド
- `docs/edit-mode.md`：編集モードの構成・仕様（開発者向け）

## 拡張候補（ロードマップ）

| 機能名 | 概要 | 難易度 | 補足 |
|---|---|---|---|
| 🎨 テーマ切替（ライト／ダーク） | prefers-color-scheme による自動判定＋手動切替スイッチ | ★☆☆ | TailwindやCSS変数で即対応可 |
| 🖼️ ギャラリービュー | サムネイルを masonry（Pinterest風）配置で一覧 | ★★☆ | react-masonry-css 等利用 |
| 🔍 検索強化（ファジー・重み付け） | タイトル/タグ/説明のファジー検索やソート | ★★☆ | fuse.js の導入やランキング付け |
| 🌈 トランジション演出強化 | ページ遷移やモーダルに Framer Motion を適用 | ★☆☆ | UX大幅向上 |
| 🗓️ 公開日／更新日表示 | 各作品にタイムスタンプを付与 | ★☆☆ | プロフィールにも最終更新を追加可 |