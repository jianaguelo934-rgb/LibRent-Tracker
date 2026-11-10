import View from './View.js';
class RentalView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('#rental-list');
    this._empty = document.querySelector('#rental-empty');
    this._form = document.querySelector('#rental-form');
    this._searchInput = document.querySelector('#rental-search');
    this._overlay = document.querySelector('#rental-confirm-overlay');
    this._details = document.querySelector('#rental-confirm-details');
    this._confirmBtn = document.querySelector('#rental-confirm-ok');
    this._cancelBtn = document.querySelector('#rental-confirm-cancel');
    this._confirmCallback = null;
    this._confirmBtn.addEventListener('click', () => {
      if (this._confirmCallback) this._confirmCallback();
      this.hideRentalConfirm();
    });
    this._cancelBtn.addEventListener('click', () => this.hideRentalConfirm());
    this._overlay.addEventListener('click', (e) => { if (e.target === this._overlay) this.hideRentalConfirm(); });
  }
  _esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  _generateMarkup() {
    if (!this._data || this._data.length === 0) { this._empty.hidden = false; return ''; }
    this._empty.hidden = true;
    return this._data.map(r => `
      <li class="item">
        <div class="item-info">
          <span class="title">${this._esc(r.customer)} — ${this._esc(r.bookTitle)}</span>
          <span class="meta">${r.days} day(s) from ${r.startDate}${r.returned ? ' · returned ' + r.returnDate + ' · fee ₱' + r.fee.toFixed(2) : ''}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="badge ${r.returned ? 'returned' : 'rented'}">${r.returned ? 'Returned' : 'Active'}</span>
          ${!r.returned ? `<button class="btn btn-success" data-action="return" data-id="${r.id}">Return</button>` : ''}
          <button class="btn btn-danger" data-action="delete-rental" data-id="${r.id}">Delete</button>
        </div>
      </li>
    `).join('');
  }
  getFormData() {
    return {
      customer: document.querySelector('#rent-customer').value.trim(),
      bookId: document.querySelector('#rent-book').value,
      days: document.querySelector('#rent-days').value,
      startDate: document.querySelector('#rent-start').value,
    };
  }
  showRentalConfirm(details, onConfirm) {
    this._confirmCallback = onConfirm;
    this._details.innerHTML = `
      <p><strong>Customer:</strong> ${this._esc(details.customer)}</p>
      <p><strong>Book:</strong> ${this._esc(details.bookTitle)}</p>
      <p><strong>Days:</strong> ${details.days}</p>
      <p><strong>Start Date:</strong> ${details.startDate}</p>
      <p class="total-fee"><strong>Total Fee:</strong> ₱${details.fee.toFixed(2)}</p>
    `;
    this._overlay.hidden = false;
  }
  hideRentalConfirm() {
    this._confirmCallback = null;
    this._overlay.hidden = true;
  }
  resetForm() { this._form.reset(); document.querySelector('#rent-days').value = 1; document.querySelector('#rent-start').value = new Date().toISOString().slice(0,10); }
  addHandlerSubmit(handler) { this._form.addEventListener('submit', e => { e.preventDefault(); handler(); }); }
  addHandlerSearch(handler) {
    if (!this._searchInput) return;
    this._searchInput.addEventListener('input', e => handler(e.target.value));
  }
  addHandlerReturn(handler) {
    this._parentElement.addEventListener('click', e => { if (e.target.dataset.action === 'return') handler(e.target.dataset.id); });
  }
  addHandlerDelete(handler) {
    this._parentElement.addEventListener('click', e => { if (e.target.dataset.action === 'delete-rental') handler(e.target.dataset.id); });
  }
}
export default new RentalView();
