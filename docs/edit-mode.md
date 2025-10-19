# 編集モード実装説明書（Silent + Interactive）

このドキュメントは、ポートフォリオサイトの「編集モード」を段階的に実装するための技術仕様・UI仕様・データ仕様のガイドです。閲覧モードと共存し、即時プレビュー（Silent）とユーザー操作（Interactive）の両面を満たします。

## ゴール
- パスワード認証で編集モードに入れる
- 作品カードの追加/削除/編集、ドラッグ＆ドロップで並び替え
- タグや進捗、説明文を編集し、即時プレビューに反映
- モジュール（作品カード・進捗バー・プロフィールなど）をブロック単位で構成/並び替え
- データをSupabase/Firebaseに永続化（ローカルスタブも用意）
- 粒子追従やテーマ演出を維持しつつ、編集UIは邪魔しない

---

## アーキテクチャ概要
- フロント: React + Vite（既存）
- 状態管理: Zustand
- ルータ: React Router
- アニメーション: GSAP（配置/並び替え時の移動）、CSS で軽量演出
- D&D: `@dnd-kit/core`（推奨）
- 永続化: Supabase（Postgres + Storage）または Firebase（Firestore + Storage）

ディレクトリ例（編集モード追加時）
```
src/
  components/
    editor/
      BlockPalette.jsx     // 追加可能ブロック一覧
      Canvas.jsx           // 粒子・光演出（編集時は控えめ）
      CardForm.jsx         // 作品カード編集フォーム
      CardList.jsx         // D&D可能なカードリスト
      Modal.jsx            // もっと見るモーダル
  pages/
    Edit.jsx               // 編集モードページ（ゲート後）
  store/
    session.js             // 認証状態（既存）
    projects.js            // 作品・並び順・設定ストア
    theme.js               // 動的テーマ（時間/場所/天気スタブ）
  lib/
    supabase.js            // クライアント & CRUD
    firebase.js            // 代替クライアント（選択制）
```

---

## 認証・セッション
- ゲート: `AuthGate.jsx`（既存）。正しいパスワードで `session.isAuthenticated = true`
- パスワード: `VITE_EDIT_PASSWORD`（未設定時は `edit1234`）
- セッション保持: `localStorage` と `Cookie` の二重化
- 不正時演出: パネル `shake` + 背景 `refuse`（既存CSS対応）

UIフロー：
1. `/edit` にアクセス → 未認証なら `AuthGate` を表示
2. パスワード成功 → `Edit.jsx` を表示
3. ヘッダーで「閲覧へ戻る」「ログアウト」操作を提供

---

## データモデル（作品カード）
```ts
type Project = {
  id: string;                // UUID
  title: string;
  tags: string[];            // #UI, #Motion など
  descriptionShort: string;  // サブ説明文
  descriptionFull?: string;  // 詳細説明（モーダル）
  progress: number;          // 0-100
  thumbnailUrl?: string;     // 画像
  mediaUrl?: string;         // YouTube/Vimeoなど外部URL
  effects?: {
    float?: boolean; glow?: boolean; spin?: boolean;
  };
  order: number;             // 並び順（昇順）
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
}
```

ブロック構成（モジュール式）
```ts
type PageBlock =
  | { type: 'project_list'; projectIds: string[] }
  | { type: 'profile'; content: string }
  | { type: 'progress'; value: number };
```

---

## ストア設計（Zustand）
`projects.js`（例）
```ts
import { create } from 'zustand'

const useProjectsStore = create((set, get) => ({
  projects: [],
  blocks: [],
  loading: false,

  load: async () => { /* Supabase/Firebase or local */ },
  addProject: (p) => set(({ projects }) => ({ projects: [...projects, p] })),
  updateProject: (id, patch) => set(({ projects }) => ({
    projects: projects.map(p => p.id === id ? { ...p, ...patch } : p)
  })),
  removeProject: (id) => set(({ projects }) => ({
    projects: projects.filter(p => p.id !== id)
  })),
  reorder: (idsInOrder) => set(({ projects }) => ({
    projects: [...projects].sort((a,b) => idsInOrder.indexOf(a.id) - idsInOrder.indexOf(b.id))
  })),
}))
```

永続化ポリシー：
- まずローカル（`localStorage`）に読み書き
- クラウド設定があれば、成功時に同期（失敗時はローカルにフォールバック）

---

## 編集UI仕様
ページ構成（`Edit.jsx`）
- ヘッダー：戻る/ログアウト
- 左側：BlockPalette（追加可能ブロック）
- 中央：CardList（D&D並び替え + GSAPで滑らか移動）
- 右側：CardForm（選択カードの編集フォーム）

CardForm項目：
- タイトル、タグ（追加・削除・カラー）、サブ説明、詳細説明
- サムネイル画像アップロード or URL入力
- 映像URL（YouTube/Vimeo）

プレビュー：
- フォーム変更は即時に `projectsStore` を更新 → Homeカードへ反映
- 「もっと見る」モーダルは `Modal` コンポーネントで制御

---

## D&Dとアニメーション
- ライブラリ：`@dnd-kit/core` + `@dnd-kit/sortable`
- ドラッグ開始/終了で `projects.reorder()` を呼ぶ
- 並び替え確定時に GSAP の `to()` で位置遷移アニメーション

注意：編集時は粒子演出を控えめに。Canvasレイヤーは透過度と発光を低く設定。

---

## 動的テーマ（スタブ）
- `themeStore` に `mode: 'day' | 'night' | 'rain'` を保持
- 起動時に `new Date()` で時間帯から初期推定
- 位置・天気は `navigator.geolocation` と天気APIをスタブ化（本番で有効化）
- CSS変数（`--accent` など）を更新

---

## モーダル（もっと見る）
- `Modal.jsx` は Portal で `#root` 直下に描画
- 詳細説明と埋め込み映像（iframe）を表示
- 閉じる演出：フェード + パーティクル微粒子消散（CSS + JS）

---

## データ永続化（Supabase例）
テーブル例：
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tags text[] default '{}',
  description_short text,
  description_full text,
  progress int default 0,
  thumbnail_url text,
  media_url text,
  effects jsonb default '{}',
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

保存フロー：
1. ローカルで編集
2. 「保存」押下でSupabaseへアップサート
3. 成功 → トースト表示、失敗 → リトライ案内（ローカルは保持）

---

## セキュリティと運用
- パスワードは `.env` で管理し、公開ビルドに直書きしない
- 画像/映像URLは拡張子・ドメインの基本検証を行う
- ファイルアップロード時はサイズ/拡張子制限（Storageルール）

---

## 実装順序（推奨）
1. ストア `projects.js` の作成（ローカル読み書き）
2. `Edit.jsx` のレイアウト（BlockPalette/CardList/CardFormの骨）
3. D&D導入（`@dnd-kit`）と `reorder()`
4. CardFormの各フィールド実装（タイトル/タグ/説明/URL）
5. 即時プレビュー連携（Homeのカード表示に反映）
6. モーダル「もっと見る」
7. Supabase連携（CRUD + Storage）
8. GSAPで並び替え演出、テーマスタブ
9. 編集演出の微調整（粒子/光）とアクセシビリティ

---

## 既存コードとの接続ポイント
- ルーティング：`App.jsx` の `/edit` を維持（認証ガード済み）
- 認証：`store/session.js`（既存）
- スタイル：`styles/global.css` を拡張（エディター用クラス追加）
- 閲覧側のカードは、後に `projectsStore.projects` を参照するよう置き換え

---

## 付録：UIコピー例
- ボタン：保存 / 取消 / 追加 / 削除 / 並び替え完了
- フィールドラベル：タイトル / タグ / サブ説明 / 詳細説明 / 画像URL / 映像URL

このドキュメントは実装に合わせて随時更新してください。