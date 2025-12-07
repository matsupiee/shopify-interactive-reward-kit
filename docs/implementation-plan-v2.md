# Interactive Reward Kit - 実装計画 v2
**現在のプロジェクト構造に基づいた実装計画**

## 現状確認

### 既存の技術スタック
- ✅ React Router 7 (v7.9.3)
- ✅ Shopify App React Router (`@shopify/shopify-app-react-router`)
- ✅ Polaris Web Components (`<s-page>`, `<s-button>` など)
- ✅ Prisma + SQLite
- ✅ 認証・セッション管理
- ✅ Webhook設定

### 必要な追加パッケージ
- ❌ Framer Motion（アニメーション用）
- ❌ 追加のディスカウントAPI権限

---

## Phase 1: 環境準備とコンポーネント実装

### 1.1 依存関係の追加

```bash
npm install framer-motion
```

### 1.2 Prismaスキーマの更新

**既存**: `prisma/schema.prisma`に以下を追加

```prisma
// ユーザー報酬ゲーム進行状況
model UserReward {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  shop        String
  currentRound Int     @default(1)
  totalAmount Int      @default(0)
  couponCode  String?
  expiresAt   DateTime?
  isUsed      Boolean  @default(false)
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  rounds      GameRound[]

  @@index([shop])
  @@index([sessionId])
}

// 各ラウンドの結果
model GameRound {
  id          String   @id @default(cuid())
  rewardId    String
  reward      UserReward @relation(fields: [rewardId], references: [id], onDelete: Cascade)
  roundNumber Int
  result      Int
  timestamp   DateTime @default(now())

  @@index([rewardId])
}

// クーポン使用履歴
model CouponUsage {
  id          String   @id @default(cuid())
  couponCode  String   @unique
  shop        String
  sessionId   String
  orderNumber String?
  usedAt      DateTime?
  createdAt   DateTime @default(now())

  @@index([shop])
  @@index([couponCode])
}
```

**マイグレーション実行**:
```bash
npx prisma migrate dev --name add_reward_tables
npx prisma generate
```

### 1.3 ディレクトリ構造の作成

```bash
mkdir -p app/components/Roulette
mkdir -p app/components/Effects
mkdir -p app/hooks
mkdir -p app/utils
```

**作成するファイル**:
```
app/
├── components/
│   ├── Roulette/
│   │   ├── RouletteWheel.tsx       # ホイールUI（Polaris Web Components対応）
│   │   ├── RouletteGame.tsx        # ゲームロジック
│   │   ├── ButtonMash.tsx          # 連打機能
│   │   └── types.ts                # 型定義
│   ├── Effects/
│   │   ├── CountdownTimer.tsx      # カウントダウン
│   │   ├── FloatingComments.tsx    # コメント演出
│   │   ├── Confetti.tsx            # 紙吹雪
│   │   └── GameComplete.tsx        # 完了画面
│   └── index.ts
├── routes/
│   ├── app.roulette.tsx            # ルーレットプレビュー
│   ├── app.settings.tsx            # 設定画面
│   └── api.game.tsx                # ゲームAPI
└── utils/
    ├── discount.server.ts          # Discount API
    └── game.server.ts              # ゲームロジック
```

---

## Phase 2: 管理画面の実装

### 2.1 ダッシュボードの更新

**ファイル**: `app/routes/app._index.tsx`

- 既存のテンプレートコードを置き換え
- 統計情報の表示（ゲーム参加数、CVR、クーポン使用率）
- Polaris Web Components使用

### 2.2 設定画面の実装

**ファイル**: `app/routes/app.settings.tsx`（新規作成）

- ルーレット有効/無効
- タイマー時間設定
- 賞金額のカスタマイズ
- 対象ユーザー設定（新規のみ/全員）

### 2.3 ルーレットプレビュー

**ファイル**: `app/routes/app.roulette.tsx`（新規作成）

- 管理画面でのルーレットテスト
- リアルタイムプレビュー

---

## Phase 3: ルーレットコンポーネントの実装

### 3.1 基本コンポーネント

**注意**: Polaris Web Componentsとの互換性を確保

```tsx
// app/components/Roulette/RouletteWheel.tsx
// Framer Motionでアニメーション
// SVGで6分割ホイール描画
```

```tsx
// app/components/Roulette/ButtonMash.tsx
// 連打カウンター
// プログレスバー
// パーティクルエフェクト
```

```tsx
// app/components/Roulette/RouletteGame.tsx
// 4ラウンドのシナリオ制御
// 状態管理（useState + Context API）
```

### 3.2 演出コンポーネント

```tsx
// app/components/Effects/CountdownTimer.tsx
// 20分タイマー、固定ヘッダー
```

```tsx
// app/components/Effects/FloatingComments.tsx
// 「やったね、ブラボー！」等の流れるコメント
```

```tsx
// app/components/Effects/GameComplete.tsx
// 最終結果画面、紙吹雪、統計表示
```

---

## Phase 4: Theme Extension（ストアフロント）

### 4.1 Extension作成

```bash
cd extensions
shopify app generate extension --type theme-app-extension --name reward-widget
```

### 4.2 App Block実装

**ディレクトリ**: `extensions/reward-widget/`

```
extensions/reward-widget/
├── blocks/
│   └── roulette-game.liquid    # ルーレット埋め込み
├── assets/
│   ├── roulette-game.js        # クライアント側ロジック
│   └── roulette-game.css       # スタイル
└── snippets/
    └── countdown-timer.liquid  # タイマーバー
```

**実装内容**:
- Liquidテンプレート
- Vanilla JS（または軽量Reactバンドル）
- ストアフロントにルーレット表示
- カートページへの埋め込み

### 4.3 App Blockの設定

```json
// extensions/reward-widget/blocks/roulette-game.liquid
{
  "name": "Interactive Reward Game",
  "target": "section",
  "settings": [
    {
      "type": "checkbox",
      "id": "enabled",
      "label": "Enable reward game",
      "default": true
    }
  ]
}
```

---

## Phase 5: 状態管理とデータ永続化

### 5.1 サーバーサイドロジック

**ファイル**: `app/utils/game.server.ts`（新規作成）

```typescript
// ゲーム状態の作成・取得
// ラウンド結果の保存
// セッション管理（sessionId or customerId）
// ゲーム履歴の追跡
```

### 5.2 Session Storageの活用

- ブラウザSessionStorageでクライアント側の状態保持
- ページリロード後も継続
- タイマー開始時刻の保存

---

## Phase 6: テストとデバッグ

### 6.1 開発環境でのテスト

```bash
npm run dev
```

- 管理画面での動作確認
- ルーレットアニメーション
- タイマー機能
- ゲームフロー全体

### 6.2 本番環境でのテスト

```bash
npm run deploy
```

- 実際のShopifyストアでテスト
- Theme Extensionの動作確認
- モバイル対応確認

---

## Phase 7: Shopify Discount API統合（最終フェーズ）

### 7.1 権限の追加

**ファイル**: `shopify.app.toml`

```toml
[access_scopes]
scopes = "write_products,write_discounts,read_customers"
```

**注意**: スコープ変更後、アプリの再インストールが必要

### 7.2 Discount API実装

**ファイル**: `app/utils/discount.server.ts`（新規作成）

```typescript
// クーポンコード生成（ユニークなコード）
// Discount Code作成（GraphQL Mutation）
// 有効期限設定（20分後）
// 割引額設定（ゲーム獲得金額に基づく）
```

### 7.3 ゲームAPI更新

**ファイル**: `app/routes/api.game.tsx`を更新

```typescript
// POST /api/game/complete を更新
// - ゲーム完了→クーポン自動発行
// - UserRewardテーブルにcouponCode保存
// - CouponUsageテーブルに記録
```

### 7.4 クーポン使用追跡

- Shopify Webhookでorder/create監視
- クーポンコード使用時にCouponUsageテーブル更新
- CVR計算のためのデータ収集

---

## マイルストーン

| Phase | 作業内容 | 推定時間 | 成果物 |
|-------|---------|---------|--------|
| Phase 1 | 環境準備 | 1日 | 依存関係、DB準備完了 |
| Phase 2 | 管理画面 | 2日 | ダッシュボード、設定画面 |
| Phase 3 | ルーレット | 3日 | ゲームコンポーネント完成 |
| Phase 4 | Theme Extension | 3日 | ストアフロント表示 |
| Phase 5 | 状態管理 | 2日 | データ永続化 |
| Phase 6 | テスト | 2日 | デバッグ、最適化 |
| Phase 7 | Discount API | 2日 | クーポン発行機能（最終） |
| **合計** | - | **15日** | **リリース可能MVP** |

**Phase順序の理由**:
- Phase 1-3: コア機能（ルーレットゲーム）を先に完成
- Phase 4: ストアフロントで実際の動作確認
- Phase 5-6: 状態管理とテスト
- Phase 7: Discount APIは最後（外部API依存、スコープ変更必要）

---

## 重要な注意点

### React Router 7 特有の考慮事項

1. **Loader/Action関数**
   - `LoaderFunctionArgs`, `ActionFunctionArgs`を使用
   - `defer`や`redirect`はReact Routerのものを使用

2. **Polaris Web Components**
   - `<s-*>`タグを使用（Reactコンポーネントではない）
   - カスタムReactコンポーネントも併用可能
   - スタイリングは通常のCSSまたはCSS Modules

3. **App Bridge統合**
   - `useAppBridge()`フックを使用
   - トースト、モーダル、ナビゲーションなど

4. **ファイルベースルーティング**
   - `app/routes/` 配下のファイル名がルートに対応
   - `app.roulette.tsx` → `/app/roulette`

---

## 次のアクション

### 即座に開始できるタスク（Phase 1）

1. **依存関係の追加**
   ```bash
   npm install framer-motion
   ```

2. **Prismaスキーマ更新**
   - UserReward、GameRound、CouponUsageテーブル追加
   - マイグレーション実行

3. **ディレクトリ構造作成**
   ```bash
   mkdir -p app/components/{Roulette,Effects}
   mkdir -p app/{hooks,utils}
   ```

### 開発の進め方

- **Phase 1-6**: Discount API無しで開発・テスト可能
- **Phase 7**: 最後にDiscount API統合（本番リリース前）
- **メリット**: コア機能を先に完成させ、段階的にリリース可能

### Phase 7を最後にする理由

1. **外部API依存**: Shopify Discount APIは外部サービス
2. **スコープ変更**: `write_discounts`追加にはアプリ再インストール必要
3. **段階的リリース**: ゲーム機能だけでも価値提供可能
4. **テスト容易性**: API無しでもゲームフロー全体をテスト可能
