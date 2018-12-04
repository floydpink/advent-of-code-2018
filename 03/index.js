const fs = require('fs');

let inputFilePath = 'input.txt'; // change this to 'input1.txt' to run the example
let FABRIC_WIDTH = inputFilePath === 'input.txt' ? 1000 : 8;

const parseIntFunc = part => parseInt(part, 10);
const trimFunc = part => part.trim();
const areaClaims = fs.readFileSync(inputFilePath)
  .toString()
  .split('\n')
  .map(line => {
    let [idString, rectangleSpec] = line.split('@').map(trimFunc);
    let [start, area] = rectangleSpec.split(':').map(trimFunc);
    let id = parseInt(idString.substring(1), 10);
    let [left, top] = start.split(',').map(trimFunc).map(parseIntFunc);
    let [width, height] = area.split('x').map(trimFunc).map(parseIntFunc);
    return {id, left, top, width, height};
  });

console.log(`areaClaims count: ${areaClaims.length}`);
// console.log(`areaClaims: ${JSON.stringify(areaClaims, null, 2)}`);

let counter = 0;
const isUnitSquareInchWithinAreaClaim = function (areaClaim, left, top) {
  counter++;

  let isWithin = left >= areaClaim.left &&
    top >= areaClaim.top &&
    (left + 1) <= (areaClaim.left + areaClaim.width) &&
    (top + 1) <= (areaClaim.top + areaClaim.height);

  // console.log(`${counter}[${areaClaim.id}]: ${isWithin} (${left}, ${top}, ${areaClaim.left}, ${areaClaim.top}, ${areaClaim.width}, ${areaClaim.height})`);

  return {isWithin, id : areaClaim.id};
};

const overlappingClaimIds = new Set();
let fabricAreaWithinTwoOrMoreClaims = 0;

for (let left = 0; left < FABRIC_WIDTH; left++) {
  for (let top = 0; top < FABRIC_WIDTH; top++) {
    let withinFirstAreaClaim = false;
    let firstAreaClaim = null;
    let areaClaimCounted = false;
    for (let areaClaim of areaClaims) {
      let unitSquareInchWithinAreaClaim = isUnitSquareInchWithinAreaClaim(areaClaim, left, top);
      if (unitSquareInchWithinAreaClaim.isWithin) {
        if (withinFirstAreaClaim) {
          if (!areaClaimCounted) {
            fabricAreaWithinTwoOrMoreClaims++;
            areaClaimCounted = true;
          }
          overlappingClaimIds.add(firstAreaClaim);
          overlappingClaimIds.add(unitSquareInchWithinAreaClaim.id);
        } else {
          withinFirstAreaClaim = true;
          firstAreaClaim = unitSquareInchWithinAreaClaim.id;
        }
      }
    }
  }
}

// console.log(`counter: ${counter}`);
console.log(`fabricWithinTwoOrMoreClaims (in square inches): ${fabricAreaWithinTwoOrMoreClaims}`);

let areaClaimIds = areaClaims.map(a => a.id);
let areaClaimIdMap = new Map();
for (let areaClaimId of areaClaimIds) {
  areaClaimIdMap.set(areaClaimId, true);
}

for (let overlappingClaimId of overlappingClaimIds.values()) {
  areaClaimIdMap.set(overlappingClaimId, false);
}

let candidateClaimIds = [];
for (let areaClaimId of areaClaimIdMap.entries()) {
  if (areaClaimId[1]) {
    candidateClaimIds.push(areaClaimId[0]);
  }
}

if (candidateClaimIds.length === 1) {
  console.log(`claimThatDoesNotOverlap: ${candidateClaimIds[0]}`);
} else {
  console.log('More than one claims exist without overlaps.');
}
