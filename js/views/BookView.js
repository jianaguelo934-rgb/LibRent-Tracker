import View from './View.js';
class BookView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('#book-list');
    this._empty = document.querySelector('#book-empty');
    this._form = document.querySelector('#book-form');
    this._idInput = document.querySelector('#book-id');
    this._submitBtn = document.querySelector('#book-submit');
    this._cancelBtn = document.querySelector('#book-cancel');
    this._searchInput = document.querySelector('#book-search');
    this._overlay = document.querySelector('#book-confirm-overlay');
    this._details = document.querySelector('#book-confirm-details');
    this._confirmBtn = document.querySelector('#book-confirm-ok');
    this._confirmCancel = document.querySelector('#book-confirm-cancel');
    this._confirmCallback = null;
    this._confirmBtn.addEventListener('click', () => {
      if (this._confirmCallback) this._confirmCallback();
      this.hideBookConfirm();
    });
    this._confirmCancel.addEventListener('click', () => this.hideBookConfirm());
    this._overlay.addEventListener('click', (e) => { if (e.target === this._overlay) this.hideBookConfirm(); });
    this._cancelBtn.addEventListener('click', () => this.resetForm());
  }
  _esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  _generateMarkup() {
    if (!this._data || this._data.length === 0) { this._empty.hidden = false; return ''; }
    this._empty.hidden = true;
    return this._data.map(b => `
      <li class="item">
        <div class="item-info">
          <span class="title">${this._esc(b.title)}</span>
          <span class="meta">${this._esc(b.author)} · ${b.copies} copies · ₱${b.pricePerDay.toFixed(2)}/day</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="badge ${this._avail(b.id) > 0 ? 'available' : 'rented'}">${this._avail(b.id)} avail</span>
          <button class="btn btn-primary" data-action="edit-book" data-id="${b.id}">Edit</button>
          <button class="btn btn-danger" data-action="delete-book" data-id="${b.id}">Delete</button>
        </div>
      </li>
    `).join('');
  }
  _avail(id) { return this._availFn ? this._availFn(id) : 0; }
  setAvailFn(fn) { this._availFn = fn; }

  showBookConfirm(details, onConfirm, heading = 'Confirm Add Book') {
    this._confirmCallback = onConfirm;
    this._overlay.querySelector('h3').textContent = heading;
    this._details.innerHTML = `
      <p><strong>Title:</strong> ${this._esc(details.title)}</p>
      <p><strong>Author:</strong> ${this._esc(details.author)}</p>
      <p><strong>Copies:</strong> ${details.copies}</p>
      <p class="total-fee"><strong>Price / Day:</strong> ₱${Number(details.pricePerDay).toFixed(2)}</p>
    `;
    this._overlay.hidden = false;
  }
  hideBookConfirm() {
    this._confirmCallback = null;
    this._overlay.hidden = true;
  }
  getFormData() {
    return {
      id: this._idInput.value || null,
      title: document.querySelector('#book-title').value.trim(),
      author: document.querySelector('#book-author').value.trim(),
      copies: document.querySelector('#book-copies').value,
      pricePerDay: document.querySelector('#book-price').value,
    };
  }
  fillForm(book) {
    this._idInput.value = book.id;
    document.querySelector('#book-title').value = book.title;
    document.querySelector('#book-author').value = book.author;
    document.querySelector('#book-copies').value = book.copies;
    document.querySelector('#book-price').value = book.pricePerDay;
    this._submitBtn.textContent = 'Update Book';
    this._cancelBtn.hidden = false;
  }
  resetForm() {
    this._form.reset();
    this._idInput.value = '';
    document.querySelector('#book-copies').value = 1;
    document.querySelector('#book-price').value = '20.00';
    this._submitBtn.textContent = 'Add Book';
    this._cancelBtn.hidden = true;
  }
  addHandlerSubmit(handler) {
    this._form.addEventListener('submit', e => { e.preventDefault(); handler(); });
  }
  addHandlerDelete(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.dataset.action === 'delete-book') handler(e.target.dataset.id);
    });
  }
  addHandlerEdit(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.dataset.action === 'edit-book') handler(e.target.dataset.id);
    });
  }
  addHandlerSearch(handler) {
    if (!this._searchInput) return;
    this._searchInput.addEventListener('input', e => handler(e.target.value));
  }
  populateBookSelect(books, availFn) {
    const sel = document.querySelector('#rent-book');
    sel.innerHTML = books.map(b => {
      const a = availFn(b.id);
      return `<option value="${b.id}" ${a <= 0 ? 'disabled' : ''}>${this._esc(b.title)} - ₱${b.pricePerDay.toFixed(2)}/day (${a} avail)</option>`;
    }).join('');
  }
}
export default new BookView();
