import merge from 'deepmerge';


export function breakToRanges(start: number, end: number, step: number) {
  let ranges = [];
  while (start <= end) {
    let endTemp = start + step - 1;
    const startTemp = start;
    endTemp = Math.min(endTemp, end);
    ranges.push([startTemp, endTemp]);
    start = endTemp + 1;
  }
  return ranges;
}

function customAdd(key) {
  return (v1, v2) => {
    if (!v1) {
      return v2;
    }
    if (!v2) {
      return v1;
    }
    if (typeof v1 == 'object' || typeof v2 == 'object') {
      return merge(v2, v1, {
        customMerge: customAdd,
        isMergeableObject: value => true
      });
    } else {
      return v1 + v2;
    }
  };
}

export function mergeWithAdd(obj1 = {}, obj2 = {}) {
  for (const k in obj2) {
    obj1[k] = obj1[k] ? obj1[k] + obj2[k] : obj2[k];
  }
  return obj1;
}
