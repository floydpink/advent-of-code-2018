const fs = require('fs');
const hamming = require('compute-hamming');

const boxIds = fs.readFileSync('input.txt')
  .toString()
  .split('\n');

console.log(`boxIds count: ${boxIds.length}`);

let twoLetterBoxCount = 0;
let threeLetterBoxCount = 0;

for (let boxId of boxIds) {
  const charMap = new Map();
  for (let char of [...boxId]) {
    if (!charMap.has(char)) {
      charMap.set(char, 0);
    }
    charMap.set(char, charMap.get(char) + 1);
  }

  const charMapCountMap = new Map();
  for (let charMapCount of charMap.values()) {
    if (!charMapCountMap.has(charMapCount)) {
      charMapCountMap.set(charMapCount, 0);
    }
    charMapCountMap.set(charMapCount, charMapCountMap.get(charMapCount) + 1);
  }
  if (charMapCountMap.has(2)) {
    twoLetterBoxCount += 1;
  }
  if (charMapCountMap.has(3)) {
    threeLetterBoxCount += 1;
  }
}

console.log(`twoLetterBoxCount: ${twoLetterBoxCount}`);
console.log(`threeLetterBoxCount: ${threeLetterBoxCount}`);

console.log(`part 1 answer: ${twoLetterBoxCount * threeLetterBoxCount}`);

let unitHammingCandidates = [];

let hammingDistancesArray = [];
for (let i = 0; i < boxIds.length; i++) {
  let hammingDistances = [];
  for (let j = 0; j < boxIds.length; j++) {
    let hammingDistance = undefined;
    if (i !== j) {
      hammingDistance = hamming(boxIds[i], boxIds[j]);
      if (hammingDistance < 2) {
        unitHammingCandidates.push({a: i, b: j});
      }
    }
    hammingDistances[j] = hammingDistance;
  }
  hammingDistancesArray[i] = hammingDistances;
}

console.log(JSON.stringify(unitHammingCandidates));

let unitHammingCandidate = unitHammingCandidates[0];
console.log(boxIds[unitHammingCandidate.a]);
console.log(boxIds[unitHammingCandidate.b]);

// find the part 2 answer manually from the last two output entries