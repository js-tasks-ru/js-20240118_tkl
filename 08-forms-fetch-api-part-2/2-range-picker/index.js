import { createElementFromHTML } from "../../utils/index.js";

export default class RangePicker {
  static #locale = "ru-RU";

  subElements = {};
  element;
  currentMonth;
  from;
  to;

  constructor({ from, to } = {}) {
    this.from = from;
    this.to = to;
    this.currentMonth = this.from || new Date();

    this.element = this.createElement("element");
    this.selectSubElements();
    this.createListeners();
  }

  static formatLocaleDate = (date) => {
    return date.toLocaleDateString(this.#locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  static areDatesEqual = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  static isDateBetween = (date, from, to) => {
    return date > from && date < to;
  };

  static isFirstDayOfMonth = (date) => {
    return date.getDate() === 1;
  };

  static getFirstDayOfMonth = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    let dayOfWeek = firstDayOfMonth.getDay();

    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    return dayOfWeek;
  };

  static getNextMonth = (date) => {
    const month = date.getMonth();
    const year = month === 11 ? date.getFullYear() + 1 : date.getFullYear();
    const day = 1;

    return new Date(year, (month + 1) % 12, day);
  };

  static getPrevMonth = (date) => {
    const year = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
    const month = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
    const day = 1;

    return new Date(year, month, day);
  };

  static getLocaleMonth = (date) => {
    return date.toLocaleString(this.#locale, { month: "long" });
  };

  static getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  static createMonthArray = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = this.getDaysInMonth(date);
    const createDayDate = (_, i) => new Date(year, month, i + 1);

    return Array.from({ length: daysInMonth }, createDayDate);
  };

  get #templates() {
    const { createTemplate } = this;

    const _elementTemplate = ({ from, to }) => {
      return `
        <div class="rangepicker">
          <div class="rangepicker__input" data-elem="input">
            <span data-elem="from">${from}</span> -
            <span data-elem="to">${to}</span>
          </div>
          <div class="rangepicker__selector" data-elem="selector"></div>
        </div>
      `;
    };

    const _selectorTemplate = ({ currentMonth, nextMonth }) => {
      return `
        <div class="rangepicker__selector-arrow"></div>
        <div data-action="prev" class="rangepicker__selector-control-left"></div>
        <div data-action="next" class="rangepicker__selector-control-right"></div>
        ${createTemplate("calendar", currentMonth)}
        ${createTemplate("calendar", nextMonth)}
      `;
    };

    const _calendarTemplate = ({ localeMonth, gridItems }) => {
      return `
        <div class="rangepicker__calendar">
          <div class="rangepicker__month-indicator">
            <time datetime="${localeMonth}">${localeMonth}</time>
          </div>
          <div class="rangepicker__day-of-week">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
          </div>
          <div class="rangepicker__date-grid">
            ${gridItems}
          </div>
        </div>
      `;
    };

    const _cellTemplate = ({ value, day, classList, startFrom }) => {
      const style = startFrom ? `style="--start-from: ${startFrom}"` : "";

      return `
        <button type="button" class="${classList}" data-value="${value}" ${style}>${day}</button>
      `;
    };

    return {
      element: () => {
        const { formatLocaleDate } = RangePicker;

        const props = {
          from: formatLocaleDate(this.from),
          to: formatLocaleDate(this.to),
        };

        return _elementTemplate(props);
      },
      selector: () => {
        const { currentMonth } = this;
        const { getNextMonth } = RangePicker;

        const props = {
          currentMonth,
          nextMonth: getNextMonth(currentMonth),
        };

        return _selectorTemplate(props);
      },
      calendar: (date) => {
        const { getLocaleMonth, createMonthArray } = RangePicker;

        const calendarDates = createMonthArray(date);
        const createCellTemplate = (date) => createTemplate("cell", date);

        const props = {
          localeMonth: getLocaleMonth(date),
          gridItems: calendarDates.map(createCellTemplate).join(""),
        };

        return _calendarTemplate(props);
      },

      cell: (date) => {
        const { from, to } = this;
        const { isFirstDayOfMonth, isDateBetween, areDatesEqual, getFirstDayOfMonth } = RangePicker;

        const classListArray = ["rangepicker__cell"];

        if (isDateBetween(date, from, to)) {
          classListArray.push("rangepicker__selected-between");
        } else {
          from && areDatesEqual(date, from) && classListArray.push("rangepicker__selected-from");
          to && areDatesEqual(date, to) && classListArray.push("rangepicker__selected-to");
        }

        const props = {
          value: date.toISOString(),
          day: date.getDate(),
          classList: classListArray.join(" "),
          startFrom: isFirstDayOfMonth(date) && getFirstDayOfMonth(date),
        };

        return _cellTemplate(props);
      },
    };
  }

  createTemplate = (templateName, data) => {
    const template = this.#templates[templateName];

    return (template && template(data)) ?? "";
  };

  selectSubElements = () => {
    this.element.querySelectorAll("[data-elem]").forEach((element) => {
      this.subElements[element.dataset.elem] = element;
    });
  };

  render = () => {
    const { selector } = this.subElements;

    selector.innerHTML = this.createTemplate("selector");
  };

  renderCalendar = () => {
    const { selector } = this.subElements;
    const { currentMonth, createTemplate } = this;
    const { getNextMonth } = RangePicker;

    const [firstCalendar, secondCalendar] = selector.querySelectorAll(".rangepicker__calendar");

    firstCalendar.outerHTML = createTemplate("calendar", currentMonth);
    secondCalendar.outerHTML = createTemplate("calendar", getNextMonth(currentMonth));
  };

  createElement(templateName, data) {
    const { createTemplate } = this;

    return createElementFromHTML(createTemplate(templateName, data));
  }

  toggle = () => {
    const isElementOpen = this.element.classList.toggle("rangepicker_open");

    if (isElementOpen) {
      document.addEventListener("click", this.handleWindowClick);
    } else {
      document.removeEventListener("click", this.handleWindowClick);
    }
  };

  handleInputClick = () => {
    this.toggle();
    this.render();
  };

  updateInput = () => {
    const { from, to } = this.subElements;
    const { formatLocaleDate } = RangePicker;

    from.innerHTML = formatLocaleDate(this.from);
    to.innerHTML = formatLocaleDate(this.to);
  };

  highlightCell = (date) => {
    const { selector } = this.subElements;

    const targetCell = selector.querySelector(`[data-value="${date.toISOString()}"]`);

    targetCell.classList.add("rangepicker__selected-from");
  };

  resetCellSelection = () => {
    const { selector } = this.subElements;
    const classNamesToRemove = [
      "rangepicker__selected-from",
      "rangepicker__selected-to",
      "rangepicker__selected-between",
    ];

    const selectedCellsCollection = selector.querySelectorAll(`[class*="rangepicker__selected"]`);

    selectedCellsCollection.forEach((cell) => cell.classList.remove(...classNamesToRemove));
  };

  updateRange = (value) => {
    const { resetRangeStart, setCompleteRange, renderCalendar, from, to } = this;
    const date = new Date(value);

    const isRangeComplete = from && to;
    const isRangePartial = from !== null && to === null;

    if (isRangeComplete) {
      resetRangeStart(date);
    } else if (isRangePartial) {
      setCompleteRange(date);
      renderCalendar();
    }
  };

  resetRangeStart = (date) => {
    const { highlightCell, resetCellSelection } = this;

    this.from = date;
    this.to = null;

    resetCellSelection();
    highlightCell(date);
  };

  setCompleteRange = (date) => {
    const { toggle, updateInput, dispatchEvent } = this;

    const from = new Date(Math.min(this.from, date));
    const to = new Date(Math.max(this.from, date));

    this.from = from;
    this.to = to;

    toggle();
    updateInput();
    dispatchEvent("date-select");
  };

  updateMonth = (action) => {
    const { renderCalendar } = this;
    const { getPrevMonth, getNextMonth } = RangePicker;

    const actionHandlers = {
      next: () => getNextMonth(this.currentMonth),
      prev: () => getPrevMonth(this.currentMonth),
    };

    const updateFunction = actionHandlers[action];

    if (!updateFunction) return;

    this.currentMonth = updateFunction();
    renderCalendar();
  };

  handleWindowClick = (e) => {
    const { element, toggle } = this;

    if (element.contains(e.target)) return;

    toggle();
  };

  handleSelectorClick = (e) => {
    e.stopPropagation();

    const { updateMonth, updateRange } = this;
    const { value, action } = e.target?.dataset;

    if (action) {
      updateMonth(action);
    } else if (value) {
      updateRange(value);
    }
  };

  createListeners = () => {
    const { input, selector } = this.subElements;

    input.addEventListener("click", this.handleInputClick);
    selector.addEventListener("click", this.handleSelectorClick);
  };

  destroyListeners = () => {
    const { input, selector } = this.subElements;

    input.removeEventListener("click", this.handleInputClick);
    selector.removeEventListener("click", this.handleSelectorClick);
  };

  dispatchEvent = (eventName) => {
    const { from, to } = this;

    const options = {
      bubbles: true,
      detail: { from, to },
    };

    this.element.dispatchEvent(new CustomEvent(eventName, options));
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    if (this.element) {
      this.remove();

      this.destroyListeners();
    }
  };
}
