import View from './View.js';
class ErrorView extends View {
  constructor() { super(); this._parentElement = document.querySelector('#error-container'); }
  renderError(errors) {
    const list = Array.isArray(errors) ? errors : [errors];
    const markup = `<div class="error-box"><ul>${list.map(e => `<li>${this._esc(e)}</li>`).join('')}</ul></div>`;
    this._clear(); this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  _esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  _generateMarkup(){ return ''; }
}
export default new ErrorView();
