export default class Cell {
  value;
  template;

  constructor({ value = "", template: customTemplate }) {
    this.value = value;
    this.template = customTemplate ? customTemplate(this.value) : this.defaultTemplate;
  }

  renderTemplate() {
    return this.template;
  }

  get defaultTemplate() {
    return `<div class="sortable-table__cell">${this.value}</div>`
  }
}

