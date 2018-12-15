let recipeArray = [3, 7];

let elf01Idx = 0;
let elf02Idx = 1;

let input = +'077201';  // number of recipes elves think they need to improve

const parseIntFunc = i => parseInt(i, 10);
while (recipeArray.length < (input + 10)) {
  let recipe01 = recipeArray[elf01Idx];
  let recipe02 = recipeArray[elf02Idx];
  const newRecipe = recipe01 + recipe02;
  recipeArray = recipeArray.concat(newRecipe.toString().split('').map(parseIntFunc));

  elf01Idx = elf01Idx + (1 + recipe01);
  elf02Idx = elf02Idx + (1 + recipe02);
  if (elf01Idx >= recipeArray.length) {
    elf01Idx = elf01Idx % recipeArray.length;
  }
  if (elf02Idx >= recipeArray.length) {
    elf02Idx = elf02Idx % recipeArray.length;
  }
}

console.log(`part 01 answer: ${recipeArray.slice(input, input + 10).join('')}`);
