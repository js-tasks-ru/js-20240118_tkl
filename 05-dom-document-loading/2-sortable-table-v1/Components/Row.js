import { Cell } from "./index.js";

export default class Row {
  #id;
  #cellList;

  constructor({ id = "", cellList = [] } = {}) {
    this.#id = id;
    this.#cellList = cellList;
  }

  renderTemplate() {
    return this.#template;
  }

  #renderCellList() {
    return this.#cellList.map(cell => new Cell(cell).renderTemplate()).join("")
  }

  get #template() {
    return `<a href="/products/${this.#id}" class="sortable-table__row">
        ${this.#renderCellList()}
      </a>`;
  }
}
