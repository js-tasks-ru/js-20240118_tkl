/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

function compareStringsBy(param) {
  const collator = new Intl.Collator(["ru", "en"], { caseFirst: "upper" });

  return (a, b) => {
    if(param === "desc") {
      return collator.compare(b, a);
    }

    return collator.compare(a, b);
  };
}

export function sortStrings(arr, param = "asc") {
  const sortedArr = [...arr].sort(compareStringsBy(param));

  return sortedArr;
}
