/**
 * @param {[]} array
 * @param {*} element
 * @param {function} compare - function that gives the difference between two elements
 * @return {number} The index of the element closest to the input element
 */

export default function closestIndex(array, element, compare) {
  if (compare(array[0], element) > 0) return 0;
  if (compare(array[array.length - 1], element) < 0) return array.length - 1;

  let low = 0,
    high = array.length;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (compare(array[mid], element) < 0) low = mid + 1;
    else high = mid -1;
  }

  return compare(array[low], element) < compare(element, array[high])
    ? low
    : high;
}
