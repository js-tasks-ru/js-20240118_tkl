const DEFAULT_IMAGE_URL =
  "https://via.placeholder.com/32";

export default class BodyItemImage {
  #firstImageURL;
  #sourceImages;
  #alt;

  constructor(images = [], alt = "Image") {
    this.#firstImageURL = images.length > 0 ? images[0].url : DEFAULT_IMAGE_URL;
    this.#sourceImages = [...images.slice(1), { url: DEFAULT_IMAGE_URL }];
    this.#alt = alt;
  }

  #getSourceImages() {
    return this.#sourceImages
      .map((image) => `<source srcset='${image.url}' type='image/jpeg'>`)
      .join("");
  }

  renderTemplate() {
    return this.#template;
  }

  get #template() {
    return `
      <picture>
        ${this.#getSourceImages()}
        <img loading="lazy" class="sortable-table-image" src="${
          this.#firstImageURL
        }" alt="${this.#alt}">
      </picture>
    `;
  }
}
