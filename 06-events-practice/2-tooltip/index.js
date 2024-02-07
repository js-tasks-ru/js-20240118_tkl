import { createElementFromHTML } from "../../utils/index.js";

class Tooltip {
  static #instance = null;

  #text = null;

  constructor() {
    this.element = null;

    if (!Tooltip.#instance) {
      Tooltip.#instance = this;
    } else {
      return Tooltip.#instance;
    }
  }

  #createElement() {
    return createElementFromHTML(this.#template);
  }

  #hide() {
    if (this.element?.parentNode) {
      this.element.remove();

      this.element = null;
      this.#text = null;
    }
  }

  #updatePosition(x, y, offset = 15) {
    this.element.style.left = `${x + offset}px`;
    this.element.style.top = `${y + offset}px`;

    return this;
  }

  get #template() {
    return `<div class="tooltip">${this.#text}</div>`;
  }

  #onPointerover = ({ target: container, x, y }) => {
    const tooltip = container.dataset?.tooltip;

    if (!tooltip) return;

    this.render(tooltip);
    this.#updatePosition(x, y);

    container.addEventListener("mousemove", this.#onPointermove);
  };

  #onPointerout = ({ target: container }) => {
    if (!container.dataset?.tooltip) return;

    this.#hide();

    container.removeEventListener("pointermove", this.#onPointermove);
  };

  #onPointermove = ({ x, y }) => {
    this.#updatePosition(x, y);
  };

  #createListeners() {
    document.addEventListener("pointerover", this.#onPointerover);
    document.addEventListener("pointerout", this.#onPointerout);
  }

  #destroyListeners() {
    document.removeEventListener("pointerover", this.#onPointerover);
    document.removeEventListener("pointerout", this.#onPointerout);
  }

  render(text = "") {
    this.#text = text;

    this.element = this.#createElement();

    document.body.append(this.element);
  }

  initialize() {
    this.#createListeners();
  }

  destroy() {
    this.#destroyListeners();
  }
}

export default Tooltip;
