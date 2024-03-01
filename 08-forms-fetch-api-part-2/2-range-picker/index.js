import { createElementFromHTML } from "../../utils/index.js";

export default class RangePicker {
  static getDaysBetweenDates = (from, to) => {
    const millisecondsToDays = (ms) => ms / (24 * 60 * 60 * 1000);
    const milliseconds = Math.abs(new Date(to).setHours(24) - new Date(from));

    return millisecondsToDays(milliseconds);
  };

  static compareDates = (date1, date2) => {
    if (date1 > date2) {
      return date1;
    } else if (date2 > date1) {
      return date2;
    } else {
      return "equal";
    }
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

  static formatLocaleDate = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const dateString = date.toLocaleDateString("ru-RU", options);

    return dateString;
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

  static getMonthName = (date) => {
    return date.toLocaleString("ru-RU", { month: "long" });
  };

  static getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return new Date(year, month + 1, 0).getDate();
  };

  subElements = {};
  currentMonth;
  element;
  from;
  to;

  constructor({ from, to } = {}) {
    this.from = from;
    this.to = to;
    this.currentMonth = this.from;

    this.element = this.createElement();

    this.selectSubElements();
    this.createListeners();
  }

  get #templates() {
    const { createTemplate } = this;

    const _elementTemplate = (from, to) => {
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

    const _selectorTemplate = (currentMonth, nextMonth) => {
      return `
        <div class="rangepicker__selector-arrow"></div>
        <div data-action="prev" class="rangepicker__selector-control-left"></div>
        <div data-action="next" class="rangepicker__selector-control-right"></div>
        ${createTemplate("calendar", currentMonth)}
        ${createTemplate("calendar", nextMonth)}
      `;
    };

    const _calendarTemplate = (monthName, gridItems) => {
      return `
        <div class="rangepicker__calendar">
          <div class="rangepicker__month-indicator">
            <time datetime="${monthName}">${monthName}</time>
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

    const _cellTemplate = (data) => {
      const { date, classList, startFrom } = data;

      const value = date.toISOString();
      const day = date.getDate();

      return `
        <button type="button" class="${classList}" data-value="${value}" ${startFrom}>${day}</button>
      `;
    };

    return {
      element: () => {
        const from = RangePicker.formatLocaleDate(this.from);
        const to = RangePicker.formatLocaleDate(this.to);

        return _elementTemplate(from, to);
      },
      selector: () => {
        const { currentMonth } = this;
        const { getNextMonth } = RangePicker;

        return _selectorTemplate(currentMonth, getNextMonth(currentMonth));
      },
      calendar: (date) => {
        const { getMonthName, getDaysInMonth } = RangePicker;

        const monthName = getMonthName(date);
        const daysInMonth = getDaysInMonth(date);

        const year = date.getFullYear();
        const monthIndex = date.getMonth();

        const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
        const gridItems = dates.map((date) => createTemplate("cell", date)).join("");

        return _calendarTemplate(monthName, gridItems);
      },

      cell: (date) => {
        const { from, to } = this;

        const isFirstDayOfMonth = RangePicker.isFirstDayOfMonth(date);
        const isBetweenDate = RangePicker.isDateBetween(date, from, to);
        const isFromDate = from !== null ? RangePicker.areDatesEqual(date, from) : false;
        const isToDate = to !== null ? RangePicker.areDatesEqual(date, to) : false;

        const classListArray = ["rangepicker__cell"];
        if (isBetweenDate) {
          classListArray.push("rangepicker__selected-between");
        } else {
          if (isFromDate) classListArray.push("rangepicker__selected-from");
          if (isToDate) classListArray.push("rangepicker__selected-to");
        }

        const classList = classListArray.join(" ");
        const startFrom = isFirstDayOfMonth ? `style="--start-from: ${RangePicker.getFirstDayOfMonth(date)}"` : "";

        return _cellTemplate({ date, classList, startFrom });
      },
    };
  }

  createTemplate = (templateName, data) => {
    return this.#templates[templateName](data);
  };

  selectSubElements() {
    this.element.querySelectorAll("[data-elem]").forEach((element) => {
      this.subElements[element.dataset.elem] = element;
    });
  }

  render() {
    const { selector } = this.subElements;

    selector.innerHTML = this.createTemplate("selector");
  }

  createElement() {
    return createElementFromHTML(this.#templates.element());
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

  updateInput() {
    const { from, to } = this.subElements;

    from.innerHTML = RangePicker.formatLocaleDate(this.from);
    to.innerHTML = RangePicker.formatLocaleDate(this.to);
  }

  updateRange = (date) => {
    if (this.from && this.to) {
      this.from = date;
      this.to = null;
    } else if (this.from !== null && this.to === null) {
      const from = new Date(Math.min(this.from, date));
      const to = new Date(Math.max(this.from, date));

      this.from = from;
      this.to = to;

      this.dispatchEvent("date-select", { from, to });
      this.updateInput();
      this.toggle();
    }

    this.render();
  };

  updateMonth = (action) => {
    const actionHandlers = {
      next: () => RangePicker.getNextMonth(this.currentMonth),
      prev: () => RangePicker.getPrevMonth(this.currentMonth),
    };

    const updateFunction = actionHandlers[action];

    if (!updateFunction) return;

    this.currentMonth = updateFunction();
    this.render();
  };

  handleWindowClick = (e) => {
    const { element } = this;

    if (!element.contains(e.target)) {
      this.toggle();
    }
  };

  handleSelectorClick = (e) => {
    e.stopPropagation();

    const { value, action } = e.target?.dataset;

    if (action) {
      this.updateMonth(action);
    } else if (value) {
      this.updateRange(new Date(value));
    }
  };

  createListeners() {
    const { input, selector } = this.subElements;

    input.addEventListener("click", this.handleInputClick);
    selector.addEventListener("click", this.handleSelectorClick);
  }

  destroyListeners() {
    const { input, selector } = this.subElements;

    input.removeEventListener("click", this.handleInputClick);
    selector.removeEventListener("click", this.handleSelectorClick);
  }

  dispatchEvent = (eventName, detail = {}) => {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      detail,
    });

    this.element.dispatchEvent(event);
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.element) {
      this.remove();

      this.destroyListeners();
    }
  }
}
