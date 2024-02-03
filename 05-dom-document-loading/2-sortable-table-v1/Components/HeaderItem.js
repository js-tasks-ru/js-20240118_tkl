export default class HeaderItem {
  #id;
  #title;
  #sortable;
  #order;

  constructor({ id = "", title = "", sortable = false, order = "" }) {
    this.#id = id;
    this.#title = title;
    this.#sortable = sortable;
    this.#order = order;
  }

  renderTemplate() {
    return this.#template;
  }

  #renderSortArrow() {
    return this.#order && this.#sortArrowTemplate;
  }

  get #sortArrowTemplate() {
    return (`
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
      `).trim();
  }

  get #template() {
    return `<div class="sortable-table__cell" data-id="${this.#id}" data-sortable="${this.#sortable}" data-order="${this.#order}">
      <span>${this.#title}</span>
      ${this.#renderSortArrow()}
    </div>`;
  }
}
