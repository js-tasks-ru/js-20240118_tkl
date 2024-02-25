import fetchJson from "./utils/fetch-json.js";
import { default as ColumnChart } from "../../04-oop-basic-intro-to-dom/1-column-chart/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChartV2 extends ColumnChart {
  subElements = {};
  #url;

  constructor(options) {
    super(options);

    this.#url = options?.url;

    this.selectSubElements();

    if (!options || !options.range) {
      this.#showLoader(true);

      return;
    }

    this.update(options.range?.from, options.range?.to);
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  async update(from, to) {
    this.#showLoader(true);

    const data = await this.#fetchData(from, to);

    if (Object.keys(data).length) {
      this.data = Object.entries(data).map(([date, value]) => value);
      this.value = this.data.length;

      this.#updateHeader();
      this.#updateBody();
      this.#showLoader(false);
    }

    return data;
  }

  #updateHeader() {
    this.subElements.header.innerHTML = this.value;
  }

  #updateBody() {
    this.subElements.body.innerHTML = this.createColumnsTemplate();
  }

  #showLoader(status = true) {
    const element = this.element;

    if (status) {
      element.classList.add("column-chart_loading");
    } else {
      element.classList.remove("column-chart_loading");
    }
  }

  async #fetchData(from, to) {
    const q = new URL(this.#url, BACKEND_URL);

    q.searchParams.set("from", from);
    q.searchParams.set("to", to);

    return await fetchJson(q);
  }
}
