export const createElementFromHTML = htmlString => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString.trim();

  return tempDiv.firstElementChild;
};