export function removeDuplicatesBy(key, styleArray) {
    var mySet = new Set();
    return styleArray.filter(function(x) {
      var key = key(x), isNew = !mySet.has(key);
      if (isNew) mySet.add(key);
      return isNew;
    });
}