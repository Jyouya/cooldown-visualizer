// binary search from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
export default function sortedInsert(array, element, compare) {
  let low = 0,
    high = array.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (compare(array[mid], element) < 0) low = mid + 1;
    else high = mid;
  }

  return [...array.slice(0, low), element, ...array.slice(low)];
}
