import View from './View.js';
class FinanceView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('#expense-list');
    this._summary = document.querySelector('#finance-summary');
    this._empty = document.querySelector('#expense-empty');
    this._form = document.querySelector('#expense-form');
  }
  renderSummary(data) {
    this._summary.innerHTML = `
      <div class="stat-card"><span class="value">₱${data.income.toFixed(2)}</span><span class="label">Rental Income</span></div>
      <div class="stat-card"><span class="value">₱${data.expenses.toFixed(2)}</span><span class="label">Expenses</span></div>
      <div class="stat-card"><span class="value">₱${data.net.toFixed(2)}</span><span class="label">Net Profit</span></div>
      <div class="stat-card"><span class="value">${data.count}</span><span class="label">Transactions</span></div>
    `;
  }
  _esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  _generateMarkup() {
    if (!this._data || this._data.length === 0) { this._empty.hidden = false; return ''; }
    this._empty.hidden = true;
    return this._data.map(e => `
      <li class="item">
        <div class="item-info">
          <span class="title">${this._esc(e.description)}</span>
          <span class="meta">${e.date}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="badge rented">₱${e.amount.toFixed(2)}</span>
          <button class="btn btn-danger" data-action="delete-expense" data-id="${e.id}">Delete</button>
        </div>
      </li>
    `).join('');
  }
  getFormData() {
    return { description: document.querySelector('#exp-desc').value.trim(), amount: document.querySelector('#exp-amount').value };
  }
  resetForm() { this._form.reset(); }
  addHandlerSubmit(handler) { this._form.addEventListener('submit', e => { e.preventDefault(); handler(); }); }
  addHandlerDelete(handler) {
    this._parentElement.addEventListener('click', e => { if (e.target.dataset.action === 'delete-expense') handler(e.target.dataset.id); });
  }
}
export default new FinanceView();
