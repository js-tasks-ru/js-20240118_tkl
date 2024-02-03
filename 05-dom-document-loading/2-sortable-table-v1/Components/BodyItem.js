import { BodyItemImage } from "./index.js";

export default class BodyItem {
  #id;
  #title;
  #quantity;
  #price;
  #sales;
  #images;
  #imageTemplate;

  constructor({
    id = "",
    title = "",
    quantity = 0,
    price = 0,
    sales = 0,
    images = [],
    imageTemplate = () => "",
  } = {}) {
    this.#id = id;
    this.#title = title;
    this.#quantity = quantity;
    this.#price = price;
    this.#sales = sales;
    this.#images = images;
    this.#imageTemplate = imageTemplate;
  }

  renderTemplate() {
    return this.#template;
  }

  get #template() {

    // Кастомное решение для картинок, которые не грузятся. Оригинальные темплейт так себе :)
    const tableItemImage = new BodyItemImage(this.#images);
    // const originalImageTemplate = this.#imageTemplate(this.#images);

    return `<a href="/products/${this.#id}" class="sortable-table__row">
        <div class="sortable-table__cell">
          ${tableItemImage.renderTemplate()}
        </div>

        <div class="sortable-table__cell">${this.#title}</div>

        <div class="sortable-table__cell">${this.#quantity}</div>
        <div class="sortable-table__cell">${this.#price}</div>
        <div class="sortable-table__cell">${this.#sales}</div>
      </a>`;
  }
}
