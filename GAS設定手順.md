# Google Apps Script 設定手順

## 概要

支出記録アプリとGoogle Spreadsheetを連携させるための設定手順です。

## あなたのID情報

- **スプレッドシートID**: `1S3XfBUJr6KrMS7EJEa5PYdRW2UabCvnpDyPH1BSV8v0`
- **Apps ScriptプロジェクトID**: `1UPfDvCbaz8mVeMBg9gH4A79_QZ5OoLaewnBqVwOXa63tdLc77EmdwPCA`

## 設定手順

### ステップ1: Google Spreadsheetを開く

1. 以下のURLにアクセスしてスプレッドシートを開きます：

```
https://docs.google.com/spreadsheets/d/1S3XfBUJr6KrMS7EJEa5PYdRW2UabCvnpDyPH1BSV8v0/edit
```

### ステップ2: Apps Scriptエディタを開く

1. スプレッドシートのメニューから **「拡張機能」** → **「Apps Script」** をクリック

2. Apps Scriptエディタが開きます

### ステップ3: コードを貼り付け

1. エディタに既存のコードがあれば、すべて削除

2. [gas-code.js](gas-code.js)の内容をすべてコピーして貼り付け

3. **Ctrl+S (Mac: Cmd+S)** で保存

4. プロジェクト名を「支出記録アプリAPI」などに変更（任意）

### ステップ4: デプロイ（重要）

#### 4-1. デプロイボタンをクリック

1. 右上の **「デプロイ」** ボタンをクリック

2. **「新しいデプロイ」** を選択

#### 4-2. デプロイ設定

1. **種類の選択**（歯車アイコン）をクリック

2. **「ウェブアプリ」** を選択

3. 以下のように設定：

   | 項目 | 設定値 |
   |------|--------|
   | 説明 | 支出記録アプリAPI（任意） |
   | 次のユーザーとして実行 | **自分** |
   | アクセスできるユーザー | **全員** |

   ⚠️ **重要**: 「アクセスできるユーザー」は必ず **「全員」** に設定してください

4. **「デプロイ」** ボタンをクリック

#### 4-3. 権限の承認

初回デプロイ時に権限の確認が表示されます：

1. **「アクセスを承認」** をクリック

2. Googleアカウントを選択

3. **「詳細」** → **「（プロジェクト名）に移動」** をクリック

4. **「許可」** をクリック

#### 4-4. WebアプリのURLを取得

1. デプロイが完了すると、**「ウェブアプリ」** のURLが表示されます

2. このURLをコピーします（例）：

```
https://script.google.com/macros/s/AKfycbxxx.../exec
```

### ステップ5: WebアプリのURLを確認・更新

#### 現在の設定状態

[main.js](main.js:18)に以下のURLが設定されています：

```javascript
const GAS_ENDPOINT = 'https://script.google.com/macros/s/1UPfDvCbaz8mVeMBg9gH4A79_QZ5OoLaewnBqVwOXa63tdLc77EmdwPCA/exec';
```

#### URLの確認方法

**方法1: デプロイ画面で確認**

1. Apps Scriptエディタで右上の **「デプロイ」** → **「デプロイを管理」** をクリック

2. 既存のデプロイの **「ウェブアプリ」** URLを確認

**方法2: 新しくデプロイ**

もし既存のデプロイURLが分からない場合：

1. 上記「ステップ4」の手順で新しくデプロイ

2. 表示されたURLをコピー

3. [main.js](main.js:18)の`GAS_ENDPOINT`を新しいURLに書き換え

### ステップ6: 動作確認

#### 6-1. Webアプリを開く

1. [index.html](index.html)をブラウザで開く

```bash
open index.html
```

#### 6-2. テストデータを記録

1. 日付、カテゴリ、金額、メモを入力

2. **「記録する」** ボタンをクリック

3. 「支出を記録しました」と表示されることを確認

#### 6-3. スプレッドシートと同期

1. **「スプレッドシートと同期」** ボタンをクリック

2. 「スプレッドシートと同期しました」と表示されることを確認

3. スプレッドシートを開いて、**「支出記録」** シートにデータが追加されているか確認

## トラブルシューティング

### 問題1: 「アクセス権限がありません」エラー

**原因**: デプロイ設定で「アクセスできるユーザー」が「全員」になっていない

**解決策**:
1. Apps Scriptエディタで「デプロイ」→「デプロイを管理」
2. デプロイを編集（鉛筆アイコン）
3. 「アクセスできるユーザー」を **「全員」** に変更
4. 「デプロイを更新」をクリック
5. 新しいURLが表示された場合は、[main.js](main.js:18)を更新

### 問題2: 「同期に失敗しました」エラー

**原因1**: URLが間違っている

**解決策**:
1. Apps Scriptで正しいURLを確認
2. [main.js](main.js:18)のURLを確認・更新

**原因2**: スプレッドシートIDが間違っている

**解決策**:
1. [gas-code.js](gas-code.js:12)のSPREADSHEET_IDを確認
2. 正しいIDは: `1S3XfBUJr6KrMS7EJEa5PYdRW2UabCvnpDyPH1BSV8v0`
3. 修正後、Apps Scriptでコードを保存して再デプロイ

### 問題3: データがスプレッドシートに表示されない

**解決策**:
1. Apps Scriptエディタで **「実行ログ」** を確認してエラーをチェック
2. スプレッドシートのシート名が **「支出記録」** になっているか確認
3. ブラウザの開発者ツール（F12）→ Consoleでエラーを確認

### 問題4: 「エンドポイントURLが設定されていません」と表示される

**原因**: [main.js](main.js:18)の`GAS_ENDPOINT`が空または間違っている

**解決策**:
1. [main.js](main.js:18)を開く
2. `GAS_ENDPOINT`に正しいURLを設定
3. ページをリロード

## 確認用リンク

### スプレッドシート

```
https://docs.google.com/spreadsheets/d/1S3XfBUJr6KrMS7EJEa5PYdRW2UabCvnpDyPH1BSV8v0/edit
```

### Apps Scriptプロジェクト

```
https://script.google.com/home/projects/1UPfDvCbaz8mVeMBg9gH4A79_QZ5OoLaewnBqVwOXa63tdLc77EmdwPCA/edit
```

## 設定完了後の使い方

### データ同期の流れ

1. Webアプリで支出を記録（localStorageに保存）
2. 「スプレッドシートと同期」ボタンをクリック
3. Google Spreadsheetにデータがバックアップされる

### 注意事項

- 同期は **手動** です（自動同期ではありません）
- 既に同期済みのデータは重複して追加されません（ID管理）
- localStorageとスプレッドシートは独立しています

### オプション機能: カテゴリ別集計シート

Apps Scriptエディタで以下の関数を手動実行すると、カテゴリ別集計シートが作成されます：

1. エディタで `createSummarySheet` 関数を選択
2. 上部の **「実行」** ボタンをクリック
3. スプレッドシートに **「カテゴリ別集計」** シートが作成される

## まとめ

設定が完了すると：

- ✅ [index.html](index.html)で支出を記録
- ✅ ブラウザのlocalStorageにデータ保存
- ✅ 「スプレッドシートと同期」ボタンでGoogle Spreadsheetにバックアップ
- ✅ 複数デバイスでデータを共有可能

---

**作成日**: 2025-11-29
**更新日**: 2025-11-29
