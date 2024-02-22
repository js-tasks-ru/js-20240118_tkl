import { default as SortableTableV1 } from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTable extends SortableTableV1 {
  isSortLocally;

  constructor(
    headersConfig = [],
    { data = [], sorted = {} } = {},
    isSortLocally = true
  ) {
    super(headersConfig, data);

    if (sorted?.id && sorted?.order && isSortLocally) {
      this.sort(sorted.id, sorted.order);
    }

    this.isSortLocally = isSortLocally;

    this.createListeners();
  }

  createListeners() {
    const { header } = this.subElements;

    header.addEventListener("pointerdown", this.onHeaderClick);
  }

  destroyListeners() {
    const { header } = this.subElements;

    header.removeEventListener("pointerdown", this.onHeaderClick);
  }

  onHeaderClick = (e) => {
    const { id, order, sortable } = e.target.closest(
      ".sortable-table__cell[data-sortable]"
    )?.dataset;

    if (!sortable) return;

    const toggleOrder = order === "desc" ? "asc" : "desc";

    if (this.isSortLocally) {
      this.sortOnClient(id, toggleOrder);
    } else {
      this.sortOnServer(id, toggleOrder);
    }
  };

  sortOnClient(id, order) {
    this.sort(id, order);
  }

  sortOnServer(id, order) {}

  destroy() {
    super.destroy();

    this.destroyListeners();
  }
}
