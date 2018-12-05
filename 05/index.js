const fs = require('fs');

const fileContents = fs.readFileSync('input.txt').toString();

let polymerUnits01 = fileContents.split('');

const reducePolymer = function (polymerUnits) {
  let start = 0;
  while (start < polymerUnits.length - 1) {
    let first = polymerUnits[start];
    let second = polymerUnits[start + 1];

    if (first.toLocaleLowerCase() === second.toLocaleLowerCase() && first !== second) {
      polymerUnits.splice(start, 2);
      if (start > 0) {
        start--;
      }
    } else {
      start++;
    }

  }
  return polymerUnits;
};

polymerUnits01 = reducePolymer(polymerUnits01);

console.log(`part 01 answer: ${polymerUnits01.length}`);

let polymerUnits02 = fileContents.split('');
const uniqueUnitTypes = new Set();
for (let unit of polymerUnits02) {
  uniqueUnitTypes.add(unit.toLocaleLowerCase());
}

let resultArray = [];
let uniqueTypesArray = [];
for (let type of uniqueUnitTypes) {
  uniqueTypesArray.push(type);
  polymerUnits02 = fileContents.replace(new RegExp(type, 'gi'), '').split('');
  polymerUnits02 = reducePolymer(polymerUnits02);
  resultArray.push(polymerUnits02.length);
}

// console.log(`uniqueTypesArray: ${JSON.stringify(uniqueTypesArray)}`);
// console.log(`resultArray: ${JSON.stringify(resultArray)}`);
console.log(`part 02 answer: ${Math.min.apply(null, resultArray)}`);
