import { default as SortableTableV1 } from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTable extends SortableTableV1 {
  constructor(
    headersConfig = [],
    { data = [], sorted = {} } = {},
    isSortLocally = false
  ) {
    super(headersConfig, data);

    if (sorted?.id && sorted?.order) {
      this.sort(sorted.id, sorted.order);
    }

    this.#createListeners();
  }

  #createListeners() {
    const { header } = this.subElements;

    header.addEventListener("click", this.#onFieldClick);
  }

  #destroyListeners() {
    const { header } = this.subElements;

    header.removeEventListener("click", this.#onFieldClick);
  }

  #onFieldClick = (e) => {
    const { id, order, sortable } = e.target.closest(
      ".sortable-table__cell[data-sortable]"
    )?.dataset;

    if (!sortable) return;

    this.sort(id, order === "desc" ? "asc" : "desc");
  };

  destroy() {
    super.destroy();
    
    this.#destroyListeners();
  }
}
