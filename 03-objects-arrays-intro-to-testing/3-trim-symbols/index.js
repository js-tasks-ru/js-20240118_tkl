/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size <= 0) return '';
  if (!size) return string;

  let newString = "";
  let currentIndex = 0;

  while (currentIndex < string.length) {
    const symbol = string[currentIndex];
    const symbolEntriesCount = countSymbolEntries(string, currentIndex, symbol);
    const maxRepeatCount = Math.min(symbolEntriesCount, size);

    newString += symbol.repeat(maxRepeatCount);
    currentIndex += symbolEntriesCount;
  }

  return newString;
}

/**
 * Counts the consecutive entries of a symbol in a string starting from a start index.
 * @param {string} string - The string to search in.
 * @param {number} startIndex - The index to start counting from.
 * @param {string} symbol - The symbol to count.
 * @returns {number} - The count of consecutive entries.
 */
function countSymbolEntries(string, startIndex, symbol) {
  let count = 0;

  for (let i = startIndex; i < string.length; i++) {
    if (string[i] !== symbol) break;

    count++;
  }

  return count;
}
