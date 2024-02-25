export default class ColumnChart {
  #chartHeight = 50;

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value.toLocaleString());
    this.element = this.createElement();
  }

  get chartHeight() {
    return this.#chartHeight;
  }

  #renderLink() {
    return this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : "";
  }

  #createColumn(currentCol) {
    const maxCol = this.data.reduce((max, item) => Math.max(max, item), 0);
    const scale = this.#chartHeight / maxCol;
    const colHeight = Math.floor(currentCol * scale);
    const percentage = Math.round((currentCol / maxCol) * 100);

    return `<div style="--value: ${colHeight}" data-tooltip="${percentage}%"></div>`;
  }

  createColumnsTemplate() {
    return [...this.data].map((col) => this.#createColumn(col)).join("");
  }

  #isLoading() {
    return this.data.length
      ? "column-chart"
      : "column-chart_loading column-chart";
  }

  renderTemplate() {
    return `
        <div class="${this.#isLoading()}" style="--chart-height: ${
      this.#chartHeight
    }">
          <div class="column-chart__title">
            Total ${this.label}
            ${this.#renderLink()}
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">${
              this.value
            }</div>
            <div data-element="body" class="column-chart__chart">
              ${this.createColumnsTemplate(this.data)}
            </div>
          </div>
        </div>`;
  }

  createElement() {
    const template = document.createElement("div");
    template.innerHTML = this.renderTemplate();

    return template.firstElementChild;
  }

  update(newData) {
    if (!Array.isArray(newData)) return;

    this.data = newData;
    this.element.querySelector(".column-chart__chart").innerHTML =
      this.createColumnsTemplate(newData);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    // Не совсем понятно что тут должно быть? Снимать events когда будут видимо 🙂
    this.remove();
  }
}
