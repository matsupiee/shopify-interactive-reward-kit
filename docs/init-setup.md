# 1. Shopify Partner アカウントでログイン（ブラウザが開きます）

```
shopify auth login
```

# 2. 新しい Shopify アプリを作成

```
mise install
node- v # -> 22.20と表示されることを確認

shopify app init
```

# プロンプトで以下を選択:

- テンプレ: Build a React Router app (recommended)
- 言語: Typescript
- アプリ名: interactive-reward-kit

# - パッケージマネージャー: npm

# ディレクトリ調整

成功するとinteractive-reward-kit/配下にファイルが作成されます

以下のコマンドで移動できます

```
mv interactive-reward-kit/* .
```

# 3. 依存関係をインストール

npm install
