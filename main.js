/* ========================================
   支出記録アプリ (Expense Tracker)
   メインJavaScriptファイル

   仕様: 仕様書.md 参照
   機能ID: F001-F041
======================================== */

/* ========================================
   定数定義
======================================== */

// localStorageのキー名
const STORAGE_KEY = 'expenses';

// Google Apps ScriptのエンドポイントURL
// デプロイ後に自動生成されたURL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyCn0OYgSB4WhHQ970RoH_mGYYSpQ4Qdwh79DlU6Em5OU-G-rFSg5e3r7Lqs3jyjIcO/exec';

/* ========================================
   DOM要素の取得
   ページ読み込み時に一度だけ取得して変数に保存
======================================== */

// フォーム要素
const expenseForm = document.getElementById('expense-form');
const dateInput = document.getElementById('date');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const memoInput = document.getElementById('memo');

// 表示要素
const expenseList = document.getElementById('expense-list');
const categorySummary = document.getElementById('category-summary');
const totalAmountElement = document.getElementById('total-amount');

// ボタン
const syncBtn = document.getElementById('sync-btn');

/* ========================================
   初期化処理
   DOMContentLoadedイベントで実行
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('支出記録アプリを初期化中...');

    // 日付入力フィールドに今日の日付を設定（デフォルト値）
    dateInput.valueAsDate = new Date();

    // localStorageからデータを読み込んで画面に表示
    renderExpenseList();
    renderCategorySummary();

    // イベントリスナーの設定
    setupEventListeners();

    console.log('初期化完了');
});

/* ========================================
   イベントリスナーの設定
======================================== */

/**
 * 各イベントリスナーを設定
 */
function setupEventListeners() {
    // フォーム送信イベント（F001-F005: 支出記録機能）
    expenseForm.addEventListener('submit', handleAddExpense);

    // 同期ボタンクリックイベント（F041-F042: Spreadsheet連携）
    syncBtn.addEventListener('click', syncWithSpreadsheet);
}

/* ========================================
   データ管理機能 (F031-F033)
======================================== */

/**
 * localStorageから支出データを読み込む
 * @returns {Array} 支出データの配列
 */
function loadExpenses() {
    const data = localStorage.getItem(STORAGE_KEY);

    // データが存在する場合はJSON.parseして返す、なければ空配列
    return data ? JSON.parse(data) : [];
}

/**
 * localStorageに支出データを保存
 * @param {Array} expenses - 保存する支出データの配列
 */
function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    console.log(`${expenses.length}件のデータを保存しました`);
}

/* ========================================
   支出記録機能 (F001-F005)
======================================== */

/**
 * 支出追加処理
 * フォーム送信時に呼ばれる
 * @param {Event} e - submitイベント
 */
function handleAddExpense(e) {
    // フォームのデフォルト送信を防止
    e.preventDefault();

    // 入力検証（F002）
    if (!validateInput()) {
        return;
    }

    // 新しい支出オブジェクトを作成
    const expense = {
        id: Date.now(), // ユニークID（タイムスタンプ）
        date: dateInput.value,
        category: categoryInput.value,
        amount: parseInt(amountInput.value),
        memo: memoInput.value || '' // メモが空の場合は空文字列
    };

    // データ保存（F003）
    const expenses = loadExpenses();
    expenses.push(expense);
    saveExpenses(expenses);

    // 画面を更新
    renderExpenseList();
    renderCategorySummary();

    // フォームをリセット（F004）
    resetForm();

    // 成功通知（F005）
    showNotification('支出を記録しました');

    console.log('支出を追加:', expense);
}

/**
 * 入力検証（F002）
 * @returns {boolean} 検証結果（true: 正常, false: エラー）
 */
function validateInput() {
    // 日付チェック
    if (!dateInput.value) {
        alert('日付を入力してください');
        return false;
    }

    // カテゴリチェック
    if (!categoryInput.value) {
        alert('カテゴリを選択してください');
        return false;
    }

    // 金額チェック
    if (!amountInput.value || parseInt(amountInput.value) < 0) {
        alert('金額を正しく入力してください（0以上の整数）');
        return false;
    }

    return true;
}

/**
 * フォームをリセット（F004）
 */
function resetForm() {
    expenseForm.reset();
    // 日付を今日に戻す
    dateInput.valueAsDate = new Date();
}

/**
 * 支出を削除（F012）
 * @param {number} id - 削除する支出のID
 */
function deleteExpense(id) {
    // 確認ダイアログ（F012）
    if (!confirm('この支出を削除しますか?')) {
        return;
    }

    // idが一致しない支出だけを残す（フィルタリング）
    let expenses = loadExpenses();
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(expenses);

    // 画面を更新
    renderExpenseList();
    renderCategorySummary();

    // 成功通知
    showNotification('支出を削除しました');

    console.log(`ID: ${id} の支出を削除しました`);
}

/* ========================================
   支出一覧表示機能 (F011-F014)
======================================== */

/**
 * 支出一覧を画面に表示（F011）
 */
function renderExpenseList() {
    const expenses = loadExpenses();

    // データが空の場合（F013）
    if (expenses.length === 0) {
        expenseList.innerHTML = '<div class="empty-message">まだ支出が記録されていません</div>';
        return;
    }

    // 日付の新しい順にソート（F011）
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // HTML生成
    const html = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div>
                    <span class="expense-category">${expense.category}</span>
                    ${expense.memo ? `<span class="expense-memo">${escapeHtml(expense.memo)}</span>` : ''}
                </div>
            </div>
            <div class="expense-amount">&yen;${formatAmount(expense.amount)}</div>
            <button class="btn btn-delete" onclick="deleteExpense(${expense.id})">削除</button>
        </div>
    `).join('');

    expenseList.innerHTML = html;
}

/* ========================================
   カテゴリ別集計機能 (F021-F024)
======================================== */

/**
 * カテゴリ別集計を画面に表示（F021-F024）
 */
function renderCategorySummary() {
    const expenses = loadExpenses();

    // カテゴリ別に集計（F021）
    const categoryTotals = {};
    let total = 0;

    expenses.forEach(expense => {
        // カテゴリごとの合計を計算
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        // 全体合計を計算
        total += expense.amount;
    });

    // カテゴリ別表示
    if (Object.keys(categoryTotals).length === 0) {
        categorySummary.innerHTML = '<div class="empty-message">データがありません</div>';
    } else {
        // 金額の大きい順にソート（F023）
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);

        // HTML生成
        const html = sortedCategories.map(([category, amount]) => `
            <div class="category-item">
                <h3>${category}</h3>
                <div class="amount">&yen;${formatAmount(amount)}</div>
            </div>
        `).join('');

        categorySummary.innerHTML = `<div class="category-summary">${html}</div>`;
    }

    // 合計金額を表示（F022, F024）
    totalAmountElement.textContent = formatAmount(total);
}

/* ========================================
   Google Spreadsheet連携機能 (F041-F042)
======================================== */

/**
 * Google Spreadsheetと同期（F041）
 */
async function syncWithSpreadsheet() {
    // エンドポイントURLが設定されていない場合
    if (!GAS_ENDPOINT) {
        alert(
            'Google Apps ScriptのエンドポイントURLが設定されていません。\n' +
            'main.js の GAS_ENDPOINT 変数に実際のURLを設定してください。'
        );
        return;
    }

    const expenses = loadExpenses();

    // 同期するデータがない場合
    if (expenses.length === 0) {
        alert('同期するデータがありません。');
        return;
    }

    // ボタンを無効化（二重送信防止）
    syncBtn.disabled = true;
    syncBtn.textContent = '同期中...';

    console.log('=== 同期開始 ===');
    console.log('エンドポイント:', GAS_ENDPOINT);
    console.log('送信データ:', expenses);

    try {
        // Google Apps ScriptにPOSTリクエスト
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({ expenses })
        });

        console.log('レスポンス受信:', response);
        console.log('ステータス:', response.status);
        console.log('OK:', response.ok);

        // レスポンスのテキストを取得
        const responseText = await response.text();
        console.log('レスポンステキスト:', responseText);

        // JSONとしてパース
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('パース結果:', result);
        } catch (e) {
            console.error('JSONパースエラー:', e);
            result = { success: false, error: 'レスポンスがJSON形式ではありません' };
        }

        if (result.success) {
            showNotification(`スプレッドシートと同期しました (${result.message || expenses.length + '件'})`);
            console.log('✅ 同期成功:', result);
        } else {
            throw new Error(result.error || '同期に失敗しました');
        }

    } catch (error) {
        console.error('❌ 同期エラー:', error);
        alert('同期に失敗しました。\n\nエラー: ' + error.message + '\n\nブラウザのコンソール(F12)で詳細を確認してください。');
    } finally {
        // ボタンを元に戻す
        syncBtn.disabled = false;
        syncBtn.textContent = 'スプレッドシートと同期';
        console.log('=== 同期処理終了 ===');
    }
}

/* ========================================
   ユーティリティ関数
======================================== */

/**
 * 日付をフォーマット（F014）
 * @param {string} dateString - 日付文字列（YYYY-MM-DD形式）
 * @returns {string} フォーマット済み日付（YYYY/MM/DD (曜日)）
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 曜日配列
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];

    return `${year}/${month}/${day} (${weekday})`;
}

/**
 * 金額をフォーマット（F024: カンマ区切り）
 * @param {number} amount - 金額
 * @returns {string} フォーマット済み金額（3桁区切り）
 */
function formatAmount(amount) {
    return amount.toLocaleString('ja-JP');
}

/**
 * HTMLエスケープ（XSS対策）
 * @param {string} text - エスケープする文字列
 * @returns {string} エスケープ済み文字列
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 通知メッセージを表示（F005）
 * @param {string} message - 表示するメッセージ
 */
function showNotification(message) {
    // 通知要素を作成
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // body に追加
    document.body.appendChild(notification);

    // 2秒後に削除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

/* ========================================
   アニメーション用CSS（動的追加）
======================================== */

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/* ========================================
   デバッグ用ヘルパー関数
   開発中のみ使用（本番では削除可）
======================================== */

/**
 * localStorageのデータをコンソールに出力
 */
function debugShowData() {
    const expenses = loadExpenses();
    console.log('=== 保存データ ===');
    console.table(expenses);
    console.log('件数:', expenses.length);
}

/**
 * localStorageのデータをすべて削除
 */
function debugClearData() {
    if (confirm('すべてのデータを削除しますか?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderExpenseList();
        renderCategorySummary();
        console.log('データを削除しました');
    }
}

// デバッグ関数をグローバルに公開（開発用）
window.debugShowData = debugShowData;
window.debugClearData = debugClearData;

console.log('Tip: debugShowData() でデータ確認、debugClearData() でデータ削除');
