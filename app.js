// ===== 定数 =====
const STORAGE_KEY = 'expenses';
const GAS_ENDPOINT = ''; // Google Apps ScriptのWebアプリURLをここに設定

// ===== DOM要素 =====
const expenseForm = document.getElementById('expense-form');
const dateInput = document.getElementById('date');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const memoInput = document.getElementById('memo');
const expenseList = document.getElementById('expense-list');
const categorySummary = document.getElementById('category-summary');
const totalAmountElement = document.getElementById('total-amount');
const syncBtn = document.getElementById('sync-btn');

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
    // 今日の日付をデフォルト設定
    dateInput.valueAsDate = new Date();

    // データ読み込みと表示
    loadExpenses();
    renderExpenseList();
    renderCategorySummary();

    // イベントリスナー設定
    expenseForm.addEventListener('submit', handleAddExpense);
    syncBtn.addEventListener('click', syncWithSpreadsheet);
});

// ===== データ管理 =====

// localStorageから支出データを読み込む
function loadExpenses() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// localStorageに支出データを保存
function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ===== 支出記録機能 =====

// 支出を追加
function handleAddExpense(e) {
    e.preventDefault();

    const expense = {
        id: Date.now(),
        date: dateInput.value,
        category: categoryInput.value,
        amount: parseInt(amountInput.value),
        memo: memoInput.value || ''
    };

    // データ保存
    const expenses = loadExpenses();
    expenses.push(expense);
    saveExpenses(expenses);

    // 表示更新
    renderExpenseList();
    renderCategorySummary();

    // フォームリセット
    expenseForm.reset();
    dateInput.valueAsDate = new Date();

    // 成功メッセージ（オプション）
    showNotification('支出を記録しました');
}

// 支出を削除
function deleteExpense(id) {
    if (!confirm('この支出を削除しますか?')) {
        return;
    }

    let expenses = loadExpenses();
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(expenses);

    // 表示更新
    renderExpenseList();
    renderCategorySummary();

    showNotification('支出を削除しました');
}

// ===== 表示機能 =====

// 支出一覧を表示
function renderExpenseList() {
    const expenses = loadExpenses();

    if (expenses.length === 0) {
        expenseList.innerHTML = '<div class="empty-message">まだ支出が記録されていません</div>';
        return;
    }

    // 日付の新しい順にソート
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenseList.innerHTML = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div>
                    <span class="expense-category">${expense.category}</span>
                    ${expense.memo ? `<span class="expense-memo">${expense.memo}</span>` : ''}
                </div>
            </div>
            <div class="expense-amount">&yen;${expense.amount.toLocaleString()}</div>
            <button class="btn btn-delete" onclick="deleteExpense(${expense.id})">削除</button>
        </div>
    `).join('');
}

// カテゴリ別集計を表示
function renderCategorySummary() {
    const expenses = loadExpenses();

    // カテゴリ別に集計
    const categoryTotals = {};
    let total = 0;

    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        total += expense.amount;
    });

    // カテゴリ別表示
    if (Object.keys(categoryTotals).length === 0) {
        categorySummary.innerHTML = '<div class="empty-message">データがありません</div>';
    } else {
        const categoryItems = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]) // 金額の大きい順
            .map(([category, amount]) => `
                <div class="category-item">
                    <h3>${category}</h3>
                    <div class="amount">&yen;${amount.toLocaleString()}</div>
                </div>
            `).join('');

        categorySummary.innerHTML = `<div class="category-summary">${categoryItems}</div>`;
    }

    // 合計金額表示
    totalAmountElement.textContent = total.toLocaleString();
}

// ===== Google Spreadsheet連携 =====

// スプレッドシートと同期
async function syncWithSpreadsheet() {
    if (!GAS_ENDPOINT) {
        alert('Google Apps ScriptのエンドポイントURLが設定されていません。\napp.js の GAS_ENDPOINT を設定してください。');
        return;
    }

    const expenses = loadExpenses();

    if (expenses.length === 0) {
        alert('同期するデータがありません。');
        return;
    }

    syncBtn.disabled = true;
    syncBtn.textContent = '同期中...';

    try {
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expenses })
        });

        showNotification('スプレッドシートと同期しました');
    } catch (error) {
        console.error('同期エラー:', error);
        alert('同期に失敗しました。エラー: ' + error.message);
    } finally {
        syncBtn.disabled = false;
        syncBtn.textContent = 'スプレッドシートと同期';
    }
}

// ===== ユーティリティ関数 =====

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];

    return `${year}/${month}/${day} (${weekday})`;
}

// 通知表示
function showNotification(message) {
    // 簡易的な通知（より高度な実装も可能）
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
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// アニメーション用CSS（動的追加）
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
