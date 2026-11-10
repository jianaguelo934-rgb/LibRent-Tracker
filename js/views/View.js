export default class View {
  _data;
  _parentElement;

  _clear() {
    this._parentElement.innerHTML = "";
  }

  render(data) {
    this._data = data;
    const markup = this._generateMarkup();
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `<li class="empty">${message}</li>`;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  update(data) {
    this.render(data);
  }

  _generateMarkup() {
    throw new Error("_generateMarkup must be implemented by subclass");
  }
}
