# 支出管理アプリ

日々の支出を記録・管理するシンプルなWebアプリケーションです。

## 機能

### 1. 支出記録
- 日付、カテゴリ、金額、メモを入力して支出を記録
- ブラウザのlocalStorageに自動保存

### 2. 支出一覧表示
- 記録した支出を日付順に一覧表示
- 各項目の削除機能

### 3. カテゴリ別集計
- 食費、交通費、娯楽費などカテゴリ別に自動集計
- 合計金額をリアルタイム表示

### 4. Google Spreadsheet連携（オプション）
- Google Spreadsheetにデータをバックアップ
- 複数デバイスでのデータ共有が可能

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **データ永続化**: localStorage + Google Spreadsheet (オプション)
- **バックエンド**: Google Apps Script (GAS)
- **ホスティング**: GitHub Pages対応

## セットアップ

### ローカルで実行

1. リポジトリをクローン
```bash
git clone <repository-url>
cd kensyu4
```

2. ブラウザで[index.html](index.html)を開く
```bash
open index.html
# または
python -m http.server 8000
# http://localhost:8000 にアクセス
```

### GitHub Pagesでホスティング

1. GitHubリポジトリを作成してプッシュ
```bash
git init
git add .
git commit -m "Initial commit: 支出管理アプリ"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

2. リポジトリの Settings → Pages → Source で `main` ブランチを選択

3. 公開URLにアクセス: `https://<username>.github.io/<repository-name>/`

## Google Spreadsheet連携の設定

### 1. Google Spreadsheetの準備

1. [Google Drive](https://drive.google.com)で新しいスプレッドシートを作成
2. スプレッドシート名を「支出管理」などに設定

### 2. Google Apps Scriptの設定

1. スプレッドシートで「拡張機能」→「Apps Script」を開く
2. [gas-code.js](gas-code.js)の内容をコピー&ペースト
3. 保存（Ctrl+S / Cmd+S）

### 3. デプロイ

1. 右上の「デプロイ」→「新しいデプロイ」
2. 種類を「ウェブアプリ」に設定
3. 以下を設定:
   - **説明**: 支出管理アプリAPI
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. 表示されたウェブアプリのURLをコピー

### 4. WebアプリにURLを設定

[app.js](app.js)の6行目を編集:

```javascript
const GAS_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

デプロイで取得したURLを貼り付けてください。

### 5. 動作確認

1. アプリで支出を記録
2. 「スプレッドシートと同期」ボタンをクリック
3. Google Spreadsheetに「支出記録」シートが作成され、データが追加されることを確認

## データ構造

### localStorage (expenses)

```json
[
  {
    "id": 1696501234567,
    "date": "2025-10-05",
    "category": "食費",
    "amount": 800,
    "memo": "ランチ"
  }
]
```

### Google Spreadsheet

| ID | 日付 | カテゴリ | 金額 | メモ | 登録日時 |
|----|------|----------|------|------|----------|
| 1696501234567 | 2025-10-05 | 食費 | 800 | ランチ | 2025/10/05 12:30:45 |

## カテゴリ一覧

- 食費
- 交通費
- 娯楽費
- 日用品
- 医療費
- 光熱費
- その他

カテゴリは[index.html](index.html)の`<select id="category">`部分で変更できます。

## ファイル構成

```
kensyu4/
├── index.html          # メインHTML
├── style.css           # スタイルシート
├── app.js              # JavaScript (フロントエンド)
├── gas-code.js         # Google Apps Scriptコード
└── README.md           # このファイル
```

## トラブルシューティング

### データが保存されない

- ブラウザのlocalStorageが有効か確認
- プライベートブラウジングモードでは無効になります

### スプレッドシート同期が失敗する

1. `app.js`の`GAS_ENDPOINT`が正しく設定されているか確認
2. Google Apps Scriptのデプロイ設定を確認
3. ブラウザの開発者ツール（F12）でエラーを確認

### GitHub Pagesで動作しない

- リポジトリがPublicになっているか確認
- Pages設定でブランチが正しく選択されているか確認

## ブラウザ対応

- Chrome (推奨)
- Firefox
- Safari
- Edge

## ライセンス

MIT License

## 開発者

このプロジェクトは学習目的で作成されました。

## 今後の拡張案

- [ ] 月別・年別集計機能
- [ ] グラフ表示（Chart.js使用）
- [ ] 予算設定と達成率表示
- [ ] CSVエクスポート機能
- [ ] フィルター・検索機能
- [ ] ダークモード対応
- [ ] PWA対応（オフライン動作）
