import fetchJson from "./utils/fetch-json.js";

import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";
const ITEMS_PER_REQUEST = 20;

export default class SortableTableV3 extends SortableTableV2 {
  isSortLocally;
  url;
  pagination = {};

  constructor(
    headersConfig,
    { data = [], sorted = {}, isSortLocally = false, url = "" } = {}
  ) {
    super(headersConfig, data);

    this.isSortLocally = isSortLocally;
    this.url = url;
    this.pagination.start = 1;
    this.pagination.end = ITEMS_PER_REQUEST + this.pagination.start;

    this.createListeners();
    this.render();
  }

  async sortOnServer(id = this.fieldValue, order = this.orderValue) {
    const { fieldValue, orderValue } = this;

    if (fieldValue === id && orderValue === order) {
      this.pagination.end += ITEMS_PER_REQUEST;
    } else {
      this.pagination.end = ITEMS_PER_REQUEST + this.pagination.start;
    }

    this.fieldValue = id;
    this.orderValue = order;
    this.data = await this.loadData();

    if (this.data.length) {
      this.updateTable();
    } else {
      this.showEmptyPlaceholder(true);
    }
  }

  sortOnClient(id = this.fieldValue, order = this.orderValue) {
    this.sort(id, order);
  }

  showLoader(status) {
    const { loading } = this.subElements;

    loading.style.display = status ? "block" : "none";
  }

  showEmptyPlaceholder(status) {
    const { emptyPlaceholder } = this.subElements;

    emptyPlaceholder.style.display = status ? "block" : "none";
  }

  createRequestURL() {
    const q = new URL(this.url, BACKEND_URL);
    const {
      pagination: { start, end },
      fieldValue,
      orderValue,
    } = this;

    q.searchParams.set("_sort", fieldValue);
    q.searchParams.set("_order", orderValue);
    q.searchParams.set("_start", start);
    q.searchParams.set("_end", end);

    return q;
  }

  async loadData() {
    const q = this.createRequestURL();

    this.showLoader(true);

    const data = await fetchJson(q);

    this.showLoader(false);

    return data;
  }

  handleBodyScroll = (e) => {
    const totalScrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const currentScrollPosition =
      window.scrollY || document.documentElement.scrollTop;

    if (currentScrollPosition >= totalScrollHeight) {
      if (this.subElements.loading.style.display !== "block") {
        this.render();
      }
    }
  };

  onHeaderClick = (e) => {
    const { id, order, sortable } = e.target.closest(
      ".sortable-table__cell[data-sortable]"
    )?.dataset;

    if (!JSON.parse(sortable)) return; // to convert string value into boolean

    const toggleOrder = order === "desc" ? "asc" : "desc";

    this.render(id, toggleOrder);
  };

  createListeners() {
    const { header } = this.subElements;

    window.addEventListener("scroll", this.handleBodyScroll);
    header.onpointerdown = this.onHeaderClick;
  }

  destroyListeners() {
    const { header } = this.subElements;

    window.removeEventListener("scroll", this.handleBodyScroll);
    header.onpointerdown = null;
  }

  async render(
    id = this.headerConfig.find((item) => item.sortable).id,
    order = "asc"
  ) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }
}
