import { createElementFromHTML } from "../../utils/index.js";

export default class DoubleSlider {
  #activeThumb = null;

  constructor({
    min = 0,
    max = 0,
    formatValue = (value) => value,
    selected,
  } = {}) {
    this.min = min;
    this.max = max;
    this.from = selected?.from || this.min;
    this.to = selected?.to || this.max;
    this.formatValue = formatValue;

    this.element = this.#createElement();
    this.subElements = this.#getSubElements();

    this.#init();
  }

  #init() {
    this.#setRange(this.from, this.to);

    this.#createListeners();
  }

  #setRange() {
    const { thumbLeft, thumbRight, progress } = this.subElements;
    const { min, max, from, to } = this;

    const offsetFromLeft = (from - min) / (max - min);
    const offsetFromRight = (max - to) / (max - min);

    const leftRange = `${Math.round(offsetFromLeft * 100)}%`;
    const rightRange = `${Math.round(offsetFromRight * 100)}%`;

    thumbLeft.style.left = progress.style.left = leftRange;
    thumbRight.style.right = progress.style.right = rightRange;
  }

  #getActiveThumbStats() {
    const { thumbLeft, thumbRight } = this.subElements;

    const activeThumb = this.#activeThumb;

    return {
      direction: activeThumb === thumbLeft ? "left" : "right",
      sibling: activeThumb === thumbLeft ? thumbRight : thumbLeft,
    };
  }

  #update(position) {
    this.#updateThumbPosition(position);
    this.#updateRangeCounter(position);
  }

  #updateThumbPosition(position) {
    const { progress } = this.subElements;
    const { direction } = this.#getActiveThumbStats();

    const positionPercent = `${position}%`;
    this.#activeThumb.style[direction] = positionPercent;
    progress.style[direction] = positionPercent;
  }

  #updateRangeCounter(thumbPosition) {
    const { thumbLeft, from, to } = this.subElements;
    const isLeftThumb = this.#activeThumb === thumbLeft;
    const { min, max, formatValue } = this;

    const rangeValue = Math.round(
      (isLeftThumb ? min : max) +
        ((max - min) / 100) * (isLeftThumb ? 1 : -1) * thumbPosition
    );

    const targetProp = isLeftThumb ? "from" : "to";
    const targetElem = isLeftThumb ? from : to;

    this[targetProp] = rangeValue;
    targetElem.textContent = formatValue(rangeValue);
  }

  #getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");

    const accumulateSubElements = (subElements, currentElement) => {
      subElements[currentElement.dataset.element] = currentElement;

      return subElements;
    };

    return [...elements].reduce(accumulateSubElements, {});
  }

  #getCurrentThumb(target = "") {
    const { thumbLeft, thumbRight } = this.subElements;

    let activeThumb = [thumbLeft, thumbRight].find(
      (thumb) => thumb.dataset.element === target.dataset?.element
    );

    return activeThumb;
  }

  #onPointerdown = (e) => {
    this.#activeThumb = this.#getCurrentThumb(e.target);

    if (!this.#activeThumb) return;

    document.documentElement.style.cursor = "grab";

    this.#activeThumb.ondragstart = () => false;
    this.#setThumbShiftX(e);

    document.addEventListener("pointerup", this.#onPointerup);
    document.addEventListener("pointermove", this.#onPointermove);
  };

  #setThumbShiftX = (e) => {
    this.#activeThumb.shiftX =
      e.clientX - this.#activeThumb.getBoundingClientRect().left;
  };

  #dispatchEvent(name, detail) {
    const customEvent = new CustomEvent(name, {
      detail,
      bubbles: true,
    });

    this.element.dispatchEvent(customEvent);
  }

  #onPointerup = (e) => {
    const { from, to } = this;

    document.documentElement.style.cursor = "unset";

    this.#dispatchEvent("range-select", {
      from,
      to,
    });

    document.removeEventListener("pointermove", this.#onPointermove);
    document.removeEventListener("pointerup", this.#onPointerup);

    this.#activeThumb = null;
  };

  #onPointermove = (e) => {
    const thumbPosition = this.#calcThumbPosition(e);

    this.#update(this.#filterBoundaries(thumbPosition));
  };

  #calcThumbPosition(e) {
    const { inner, thumbLeft } = this.subElements;
    const {
      left: innerLeft,
      right: innerRight,
      width: innerWidth,
    } = inner.getBoundingClientRect();

    const isLeftThumb = this.#activeThumb === thumbLeft;
    const thumbShiftX = this.#activeThumb.shiftX;
    const thumbRelativeX = isLeftThumb ? e.x - innerLeft : innerRight - e.x;

    const position = ((thumbRelativeX + thumbShiftX) / innerWidth) * 100;

    return position;
  }

  #filterBoundaries(position) {
    const { direction, sibling } = this.#getActiveThumbStats();

    const siblingDirection = direction === "left" ? "right" : "left";
    const siblingThumbOffset = sibling.style[siblingDirection];

    return Math.max(
      0, // Min value
      Math.min(position, 100 - (parseFloat(siblingThumbOffset) || 0)) // Max value
    );
  }

  get #template() {
    const { from, to, formatValue } = this;

    return `
      <div class="range-slider">
        <span data-element="from">${formatValue(from)}</span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${formatValue(to)}</span>
      </div>
    `;
  }

  #createElement() {
    const element = createElementFromHTML(this.#template);

    return element;
  }

  #createListeners() {
    const { inner } = this.subElements;

    inner.addEventListener("pointerdown", this.#onPointerdown);
  }

  #destroyListeners() {
    const { inner } = this.subElements;

    inner.removeEventListener("pointerdown", this.#onPointerdown);
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    this.#destroyListeners();
  }
}

class ActiveThumb {
  constructor(element) {
    this.element = element;
  }
}
