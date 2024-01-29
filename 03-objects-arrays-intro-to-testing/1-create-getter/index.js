/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keys = path.split(".");

  return obj => {
    let value = obj;

    for (let i = 0; i < keys.length; i++) {
      if (!(keys[i] in value)) return undefined;

      value = value[keys[i]];
    }

    return value;
  };
}

// Creative approach, although being less efficient due to O(n) complexity

// function createGetter(path) {
//   return (obj) => {
//     let keys = path.split(".");
//     let value = obj;

//     while (keys.length) {
//       if (value === undefined || value === null) return undefined;

//       value = value[keys.splice(0, 1)[0]];
//     }

//     return value;
//   };
// }
