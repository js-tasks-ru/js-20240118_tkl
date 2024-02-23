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

    if (!JSON.parse(sortable)) return; // to convert string value into boolean

    const toggleOrder = order === "desc" ? "asc" : "desc";

    this.sort(id, toggleOrder);
  };

  destroy() {
    super.destroy();

    this.destroyListeners();
  }
}
