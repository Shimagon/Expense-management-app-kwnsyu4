// ===== Google Apps Script: スプレッドシート連携コード =====
//
// 使い方:
// 1. Google Driveで新しいスプレッドシートを作成
// 2. 「拡張機能」→「Apps Script」を開く
// 3. このコードを貼り付け
// 4. デプロイ → 新しいデプロイ → ウェブアプリとして公開
// 5. アクセス権限を「全員」に設定
// 6. デプロイURLをapp.jsのGAS_ENDPOINTに設定

// スプレッドシートID（あなたのスプレッドシートID）
const SPREADSHEET_ID = '1S3XfBUJr6KrMS7EJEa5PYdRW2UabCvnpDyPH1BSV8v0';
const SHEET_NAME = '支出記録';

// POSTリクエストを処理
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const expenses = data.expenses;

    // スプレッドシート取得または作成
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // ヘッダー行を追加
      sheet.appendRow(['ID', '日付', 'カテゴリ', '金額', 'メモ', '登録日時']);
      sheet.getRange('A1:F1').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // 既存のIDを取得（重複を避けるため）
    const existingIds = new Set();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      ids.forEach(row => existingIds.add(row[0]));
    }

    // 新しいデータのみを追加
    const newExpenses = expenses.filter(expense => !existingIds.has(expense.id));

    if (newExpenses.length > 0) {
      const rows = newExpenses.map(expense => [
        expense.id,
        expense.date,
        expense.category,
        expense.amount,
        expense.memo,
        new Date().toLocaleString('ja-JP')
      ]);

      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 6).setValues(rows);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `${newExpenses.length}件のデータを同期しました`,
      totalRecords: expenses.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// GETリクエストを処理（スプレッドシートからデータ取得）
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        expenses: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    const expenses = data.map(row => ({
      id: row[0],
      date: row[1],
      category: row[2],
      amount: row[3],
      memo: row[4]
    }));

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      expenses: expenses
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// カテゴリ別集計をスプレッドシートに追加する関数（オプション）
function createSummarySheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dataSheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!dataSheet) {
    Logger.log('支出記録シートが見つかりません');
    return;
  }

  // 集計シート作成または取得
  let summarySheet = spreadsheet.getSheetByName('カテゴリ別集計');
  if (summarySheet) {
    summarySheet.clear();
  } else {
    summarySheet = spreadsheet.insertSheet('カテゴリ別集計');
  }

  // ヘッダー
  summarySheet.appendRow(['カテゴリ', '合計金額', '件数', '平均金額']);
  summarySheet.getRange('A1:D1').setFontWeight('bold');

  // データ取得
  const lastRow = dataSheet.getLastRow();
  if (lastRow <= 1) return;

  const categories = dataSheet.getRange(2, 3, lastRow - 1, 1).getValues();
  const amounts = dataSheet.getRange(2, 4, lastRow - 1, 1).getValues();

  // カテゴリ別に集計
  const categoryData = {};
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i][0];
    const amount = amounts[i][0];

    if (!categoryData[category]) {
      categoryData[category] = { total: 0, count: 0 };
    }

    categoryData[category].total += amount;
    categoryData[category].count += 1;
  }

  // シートに出力
  const summaryRows = Object.entries(categoryData).map(([category, data]) => [
    category,
    data.total,
    data.count,
    Math.round(data.total / data.count)
  ]);

  // 合計金額の降順でソート
  summaryRows.sort((a, b) => b[1] - a[1]);

  summarySheet.getRange(2, 1, summaryRows.length, 4).setValues(summaryRows);

  // 合計行を追加
  const totalAmount = summaryRows.reduce((sum, row) => sum + row[1], 0);
  const totalCount = summaryRows.reduce((sum, row) => sum + row[2], 0);
  summarySheet.appendRow(['合計', totalAmount, totalCount, '']);
  summarySheet.getRange(summaryRows.length + 2, 1, 1, 4).setFontWeight('bold');

  Logger.log('集計シートを作成しました');
}
