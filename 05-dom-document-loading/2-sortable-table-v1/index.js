import { Row, Field } from "./Components/index.js";
import { createElementFromHTML } from "../../utils/index.js";

export default class SortableTable {
  data;
  headerConfig;
  fieldValue = null;
  orderValue = null;

  constructor(headerConfig = [], data = []) {
    this.data = data;
    this.headerConfig = headerConfig;

    this.element = this.renderTemplate();
    this.subElements = this.getSubElements();
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
      
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeader()}
          </div>
      
          <div data-element="body" class="sortable-table__body">
            ${this.renderRows()}
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

  get fieldValue() {
    return this.fieldValue;
  }

  get orderValue() {
    return this.orderValue;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");

    const accumulateSubElements = (subElements, currentElement) => {
      subElements[currentElement.dataset.element] = currentElement;

      return subElements;
    };

    return [...elements].reduce(accumulateSubElements, {});
  }

  renderTemplate() {
    return createElementFromHTML(this.template);
  }

  renderHeader() {
    const getFieldOrderValue = ({ id }) => (id === this.fieldValue) ? this.orderValue : "";

    return this.headerConfig
      .map((field) => new Field({ ...field, order: getFieldOrderValue(field) }).renderTemplate())
      .join("");
  }

  renderRows() {
    const rows = this.data.map((row) => {
      const getCellList = ({ id, template }) => {
        const value = row[id];

        if (!value) return;

        return {
          value,
          template,
        };
      };

      const cellList = this.headerConfig.map(getCellList);

      return {
        id: row.id,
        cellList,
      };
    });

    return rows.map((row) => new Row(row).renderTemplate()).join("");
  }

  getSortMethod(sortType) {
    const sortMethod = (a, b) => {
      const valA = a[this.fieldValue];
      const valB = b[this.fieldValue];

      const methods = {
        string: (locales = ["ru", "en"], options = { caseFirst: "upper" }) => {
          return new Intl.Collator(locales, options).compare(valA, valB);
        },
        number: () => valA - valB,
      };

      return methods[sortType]();
    };

    if (this.orderValue === "desc") {
      return (a, b) => -sortMethod(a, b);
    }

    return sortMethod;
  }

  updateRows() {
    this.subElements.body.innerHTML = this.renderRows();
  }

  updateHeader() {
    this.subElements.header.innerHTML = this.renderHeader();
  }

  updateTable() {
    this.updateRows();
    this.updateHeader();
  }

  hasSortChanged(fieldValue, orderValue) {
    return this.fieldValue !== fieldValue || this.orderValue !== orderValue;
  }

  sort(fieldValue, orderValue) {
    // Check if the sort field or order has changed
    if (!this.hasSortChanged(fieldValue, orderValue)) return;

    // Find the column configuration for the specified field and destructure its properties
    const columnConfig = this.headerConfig.find(
      (column) => column.id === fieldValue
    );
    const { sortable, sortType } = columnConfig || {};

    // Check if the column is found and is sortable
    if (!sortable) return;

    // Update the current sorting state
    this.fieldValue = fieldValue;
    this.orderValue = orderValue;

    // Sort the data using the sort type from the column configuration
    this.data = this.data.sort(this.getSortMethod(sortType));

    // Update the table display
    this.updateTable();
  }

  destroy() {
    this.element.remove();
  }
}
