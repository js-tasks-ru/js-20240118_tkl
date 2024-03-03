import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";
import { createElementFromHTML } from "../../utils/index.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  static sanitizeData = (data = {}) => {
    const entries = Object.entries(data);
    const sanitizeValues = ([key, value]) => [key, (value = escapeHtml(value))];

    return Object.fromEntries(entries.map(sanitizeValues));
  };

  data = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    price: 100,
    discount: 0,
    images: [],
  };
  subElements = {};
  categories = [];

  constructor(productId) {
    this.productId = productId;
    this.element = this.createElement("element");

    this.selectSubElements();
    this.createListeners();
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  get hasProductId() {
    return this.productId !== undefined;
  }

  get #templates() {
    const { createTemplate } = this;
    const { sanitizeData } = ProductForm;

    const _elementTemplate = ({ title, description, quantity, status, price, discount }) => {
      return `
        <div class="product-form">
          <form data-element="productForm" class="form-grid">
            <div class="form-group form-group__half_left">
              <fieldset>
                <label class="form-label">Название товара</label>
                <input id="title" value="${title}" required="" type="text" name="title" class="form-control" placeholder="Название товара">
              </fieldset>
            </div>
            <div class="form-group form-group__wide">
              <label class="form-label">Описание</label>
              <textarea id="description" value="${description}" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
            </div>
            <div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              <div data-element="imageListContainer">
                <ul class="sortable-list">
                  ${createTemplate("images")}
                </ul>
              </div>
              <button id="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            </div>
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              <select class="form-control" id="subcategory" name="subcategory">
                ${createTemplate("subcategory")}
              </select>
            </div>
            <div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                <label class="form-label">Цена ($)</label>
                <input id="price" value="${price}" required="" type="number" name="price" class="form-control" placeholder="100">
              </fieldset>
              <fieldset>
                <label class="form-label">Скидка ($)</label>
                <input id="discount" value="${discount}" required="" type="number" name="discount" class="form-control" placeholder="0">
              </fieldset>
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Количество</label>
              <input id="quantity" value="${quantity}" required="" type="number" class="form-control" name="quantity" placeholder="1">
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Статус</label>
              <select id="status" value="${status}" class="form-control" name="status">
                <option value="1">Активен</option>
                <option value="0">Неактивен</option>
              </select>
            </div>
            <div class="form-buttons">
              <button type="submit" name="save" class="button-primary-outline">
                Сохранить товар
              </button>
            </div>
          </form>
        </div>
      `;
    };

    const _imageTemplate = ({ source, url }) => {
      return `
        <li class="products-edit__imagelist-item sortable-list__item">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${url}">
            <span>${source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `;
    };

    const _subcategoryTemplate = ({ categoryTitle, id, title }) => {
      return `
        <option value="${id}">${categoryTitle} > ${title}</option>
      `;
    };

    return {
      element: (data = this.data) => {
        const props = sanitizeData(data);

        return _elementTemplate(props);
      },
      images: (data = this.data.images) => {
        return data.map((image) => createTemplate("image", image)).join("");
      },
      image: (data = "") => {
        const props = sanitizeData(data);

        return _imageTemplate(props);
      },
      subcategory: (categories = this.categories) => {
        const createSubcategory = (categoryTitle, subcategory) => {
          const props = sanitizeData({ categoryTitle, ...subcategory });

          return _subcategoryTemplate(props);
        };

        const createCategory = ({ title: categoryTitle, subcategories }) => {
          return subcategories.map((subcategory) => createSubcategory(categoryTitle, subcategory)).join("");
        };

        return categories.map(createCategory).join("");
      },
    };
  }

  async render() {
    const { fetchData, hasProductId } = this;

    const categoriesPromise = fetchData("categories");
    const productPromise = hasProductId ? fetchData("products") : Promise.resolve([]);

    const [categories, [product]] = await Promise.all([categoriesPromise, productPromise]);

    this.data = product ?? this.data;
    this.categories = categories;

    this.updateForm();

    return this.element;
  }

  updateForm = () => {
    const { createTemplate, updateInputFields, data } = this;
    const { productForm, imageListContainer } = this.subElements;

    const imageList = imageListContainer.querySelector('.sortable-list');
    const subcategory = productForm.querySelector("#subcategory");

    imageList.innerHTML = createTemplate("images", data.images);
    subcategory.innerHTML = createTemplate("subcategory");

    updateInputFields();
  };

  updateInputFields = () => {
    const { productForm } = this.subElements;

    const formElements = [...productForm.elements];

    const updateField = (element) => {
      const value = this.data[element.name];

      if (value !== undefined) {
        element.value = value;
      }
    };

    formElements.forEach(updateField);
  };

  createTemplate = (templateName, data) => {
    const template = this.#templates[templateName];

    return (template && template(data)) ?? "";
  };

  handleImageMousedown = (e) => {
    const { deleteHandle, grabHandle } = e.target?.dataset;

    const isDeleteAction = deleteHandle === "";
    const isDragAction = grabHandle === "";

    if (isDeleteAction) {
      this.deleteImage(e.target);
    } else if (isDragAction) {
      this.dragImage(e);
    }
  };

  save = async (body) => {
    const url = new URL("/api/rest/products", BACKEND_URL);
    const method = this.hasProductId ? "PATCH" : "POST";

    const response = await fetchJson(url, {
      method,
      body,
    });

    this.dispatchEvent(this.hasProductId ? "product-updated" : "product-saved");

    return response;
  };

  handleFormSubmit = async (e) => {
    e.preventDefault();

    const { productForm } = this.subElements;

    const formData = new FormData(productForm);

    await this.save(formData);
  };

  handleProductImageUpload = (e) => {
    let fileInput = getImageFileInput();

    fileInput.click();

    if (!fileInput.isConnected) {
      document.body.appendChild(fileInput);

      fileInput.onchange = async () => {
        const { productForm, imageListContainer } = this.subElements;
        const uploadImageButton = productForm.querySelector("#uploadImage");
        const file = fileInput.files[0];

        if (file !== undefined) {
          const body = new FormData();
          body.append("image", file, file.name);

          uploadImageButton.classList.add("is-loading");

          const response = await this.uploadImage(body);

          uploadImageButton.classList.remove("is-loading");

          const imageElement = this.createElement("image", { source: file.name, url: response.data.link });

          imageListContainer.firstElementChild.appendChild(imageElement);
        }

        fileInput.onchange = null;

        document.body.removeChild(fileInput);
      };
    }

    function getImageFileInput() {
      let fileInput = document.getElementById("uploadImageInput");

      if (!fileInput) {
        fileInput = document.createElement(`input`);
        fileInput.id = "uploadImageInput";
        fileInput.name = "image";
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
      }

      return fileInput;
    }
  };

  uploadImage = async (body) => {
    const url = new URL("https://api.imgur.com/3/image");
    const headers = new Headers({ Authorization: IMGUR_CLIENT_ID });

    const response = await fetchJson(url, {
      method: "POST",
      headers,
      body,
    });

    return response;
  };

  deleteImage = (target) => {
    target.closest("li.products-edit__imagelist-item").remove();
  };

  dragImage = (e) => {};

  createElement(templateName, data) {
    const { createTemplate } = this;

    return createElementFromHTML(createTemplate(templateName, data));
  }

  createListeners() {
    const { productForm, imageListContainer } = this.subElements;
    const uploadImage = productForm.querySelector("#uploadImage");

    productForm.addEventListener("submit", this.handleFormSubmit);
    uploadImage.addEventListener("click", this.handleProductImageUpload);
    imageListContainer.addEventListener("pointerdown", this.handleImageMousedown);
  }

  destroyListeners() {
    const { productForm, imageListContainer } = this.subElements;
    const uploadImage = productForm.querySelector("#uploadImage");

    productForm.removeEventListener("submit", this.handleFormSubmit);
    uploadImage.removeEventListener("click", this.handleProductImageUpload);
    imageListContainer.removeEventListener("pointerdown", this.handleImageMousedown);
  }

  fetchData = async (endpoint) => {
    const url = this.createURL(endpoint);

    const response = await fetchJson(url);

    return response;
  };

  createURL = (endpoint, params = {}) => {
    const url = new URL(`/api/rest/${endpoint}`, BACKEND_URL);
    const productId = this.productId;

    const queryParams = {
      products: {
        id: productId,
        ...params,
      },
      categories: {
        _sort: "weight",
        _refs: "subcategory",
        ...params,
      },
    };

    Object.entries(queryParams[endpoint]).forEach((param) => url.searchParams.set(...param));

    return url;
  };

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
    if (!this.element) return;

    this.remove();
    this.destroyListeners();

    this.element = null;
    this.subElements = null;
    this.productId = null;
    this.data = null;
    this.categories = null;
  }
}
