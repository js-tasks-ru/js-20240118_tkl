import { BodyItem, HeaderItem } from "./Components/index.js";
import { createElementFromHTML } from "../../utils/index.js";

export default class SortableTable {
  #data;
  #headerConfig;
  #fieldValue = null;
  #orderValue = null;

  constructor(headerConfig = [], data = []) {
    this.#data = data;
    this.#headerConfig = headerConfig;

    this.element = this.#renderTemplate();
    this.subElements = this.#getSubElements();
  }

  get #template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
    
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.#renderHeaderItems()}
        </div>
    
        <div data-element="body" class="sortable-table__body">
          ${this.#renderBodyItems()}
        </div>
    
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
    
      </div>
    </div>
    `;
  }

  #getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");

    return [...elements].reduce((subElements, currentElement) => {
      subElements[currentElement.dataset.element] = currentElement;

      return subElements;
    }, {});
  }

  #getImageTemplate() {
    return (
      this.#headerConfig.find((config) => typeof config.template === "function")
        ?.template || ""
    );
  }

  #renderTemplate() {
    return createElementFromHTML(this.#template);
  }

  #renderHeaderItems() {
    const bodyItems = this.#headerConfig.map((item) => {
      if (item.id !== this.#fieldValue)
        return new HeaderItem(item).renderTemplate();

      return new HeaderItem({
        ...item,
        order: this.#orderValue,
      }).renderTemplate();
    });

    return bodyItems.join("");
  }

  #renderBodyItems() {
    const bodyItems = this.#data.map((item) =>
      new BodyItem({
        ...item,
        imageTemplate: this.#getImageTemplate(),
      }).renderTemplate()
    );

    return bodyItems.join("");
  }

  #sortBy(columnToSort) {
    const { sortType } = columnToSort;

    let compareMethod = (a, b) => {
      const valA = a[this.#fieldValue];
      const valB = b[this.#fieldValue];

      if (sortType === "string") {
        const collator = new Intl.Collator(["ru", "en"], {
          caseFirst: "upper",
        });
        return collator.compare(valA, valB);
      } else {
        return valA - valB;
      }
    };

    return this.#orderValue === "desc"
      ? (a, b) => -compareMethod(a, b)
      : compareMethod;
  }

  #hasSortChanged(fieldValue, orderValue) {
    return this.#fieldValue !== fieldValue || this.#orderValue !== orderValue;
  }

  #updateBody() {
    this.subElements.body.innerHTML = this.#renderBodyItems();
  }

  #updateHeader(fieldValue = "", orderValue = "") {
    this.subElements.header.innerHTML = this.#renderHeaderItems(
      fieldValue,
      orderValue
    );
  }

  sort(fieldValue, orderValue) {
    if (!this.#hasSortChanged(fieldValue, orderValue)) return;

    const columnToSort = this.#headerConfig.find(
      (column) => column.id === fieldValue
    );

    if (!columnToSort || !columnToSort.sortable) return;

    this.#fieldValue = fieldValue;
    this.#orderValue = orderValue;

    this.#data = [...this.#data].sort(this.#sortBy(columnToSort));

    this.#updateBody();
    this.#updateHeader();
  }

  destroy() {
    this.element.remove();
  }
}
