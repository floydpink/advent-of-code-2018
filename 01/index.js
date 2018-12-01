const fs = require('fs');

const frequencyChanges = fs.readFileSync('input.txt')
  .toString()
  .split('\n')
  .map(i => parseInt(i, 10));

console.log(`frequencyChanges count: ${frequencyChanges.length}`);

const resultingFrequency = frequencyChanges.reduce((p, c) => p + c);

console.log(`resultingFrequency: ${resultingFrequency}`);

let firstFrequencyToRepeat = 0;

let resultFrequenciesMap = new Set();

let cycleCount = 0;
const checkForRepeatingFrequency = function (frequencyChanges, resultFrequencies, firstFrequencyToRepeat) {
  cycleCount++;
  for (let frequency of frequencyChanges) {
    resultFrequencies.add(firstFrequencyToRepeat);

    firstFrequencyToRepeat += frequency;

    if (resultFrequencies.has(firstFrequencyToRepeat)) {
      return {found : true, firstFrequencyToRepeat};
    }
  }

  return {found : false, firstFrequencyToRepeat};
};

let repeatingFrequencyFound = false;
while (!repeatingFrequencyFound) {
  const returnValue = checkForRepeatingFrequency(frequencyChanges, resultFrequenciesMap, firstFrequencyToRepeat);
  firstFrequencyToRepeat = returnValue.firstFrequencyToRepeat;
  repeatingFrequencyFound = returnValue.found;
}

console.log(`firstFrequencyToRepeat: ${firstFrequencyToRepeat}`);
console.log(`resultFrequenciesMap count: ${resultFrequenciesMap.size}`);
console.log(`cycleCount: ${cycleCount}`);