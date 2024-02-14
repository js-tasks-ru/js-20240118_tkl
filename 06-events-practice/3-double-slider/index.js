import { createElementFromHTML } from "../../utils/index.js";

export default class DoubleSlider {
  #activeThumb = null;
  #thumbShiftX;
  #sliderInnerRect;

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
      isLeftThumb: activeThumb === thumbLeft,
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
    const { from, to } = this.subElements;
    const { isLeftThumb } = this.#getActiveThumbStats();
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

  #getActiveThumb(target = "") {
    const { thumbLeft, thumbRight } = this.subElements;

    let activeThumb = [thumbLeft, thumbRight].find(
      (thumb) => thumb.dataset.element === target.dataset?.element
    );

    return activeThumb;
  }

  #onPointerdown = (e) => {
    this.#activeThumb = this.#getActiveThumb(e.target);

    if (!this.#activeThumb) return;

    if (!this.#sliderInnerRect) {
      this.#sliderInnerRect = this.subElements.inner.getBoundingClientRect();
    }

    this.#setThumbShiftX(e);

    document.documentElement.style.cursor = "grab";

    this.#activeThumb.ondragstart = () => false;
  };

  #setThumbShiftX = (e) => {
    const slider = this.element;
    const inner = this.subElements.inner;
    const thumb = this.#activeThumb;

    const thumbOffset = slider.offsetLeft + inner.offsetLeft + thumb.offsetLeft;

    this.#thumbShiftX = e.clientX - thumbOffset;
  };

  #dispatchEvent(name, detail) {
    const customEvent = new CustomEvent(name, {
      detail,
      bubbles: true,
    });

    this.element.dispatchEvent(customEvent);
  }

  #onPointerup = (e) => {
    if (!this.#activeThumb) return;

    const { from, to } = this;

    document.documentElement.style.cursor = "unset";

    this.#dispatchEvent("range-select", {
      from,
      to,
    });

    this.#activeThumb = null;
  };

  #onPointermove = (e) => {
    if (!this.#activeThumb) return;

    const thumbPosition = this.#calcThumbPosition(e);

    this.#update(this.#filterBoundaries(thumbPosition));
  };

  #calcThumbPosition(e) {
    const { isLeftThumb } = this.#getActiveThumbStats();

    const {
      left: sliderLeftX,
      width: sliderWidth,
      right: sliderRightX = sliderLeftX + sliderWidth,
    } = this.#sliderInnerRect;

    const thumbShiftX = this.#thumbShiftX;
    const thumbWidth = this.#activeThumb.offsetWidth;

    const offsetX = isLeftThumb
      ? e.clientX - sliderLeftX - thumbShiftX + thumbWidth
      : sliderRightX - e.clientX + thumbShiftX;

    const position = (offsetX / sliderWidth) * 100;

    return position;
  }

  #filterBoundaries(position) {
    const { direction, sibling } = this.#getActiveThumbStats();

    const siblingDirection = direction === "left" ? "right" : "left";
    const siblingThumbOffset = sibling.style[siblingDirection];

    return Math.max(
      0,
      Math.min(position, 100 - (parseFloat(siblingThumbOffset) || 0))
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
    document.addEventListener("pointerup", this.#onPointerup);
    document.addEventListener("pointermove", this.#onPointermove);
  }

  #destroyListeners() {
    const { inner } = this.subElements;

    inner.removeEventListener("pointerdown", this.#onPointerdown);
    document.removeEventListener("pointermove", this.#onPointermove);
    document.removeEventListener("pointerup", this.#onPointerup);
  }

  destroy() {
    this.element?.remove();
    this.element = null;
  
    this.#destroyListeners();
  }
}
