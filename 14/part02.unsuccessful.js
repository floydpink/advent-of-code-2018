let input = '59414';  // number of recipes elves think they need to improve
// let input = '077201';
//    !!! Node.js collection table size limitation prevented this from getting to the answer in JS

class Recipes {
  constructor() {
    this.index = -1;
    this.matchStart = 0;

    this.map = new Map();
  }

  createRecipe(idx, recipe) {
    if (!this.map.has(idx)) {
      this.map.set(idx, recipe);
    } else {
      throw new Error(`Index '${idx}' already exist.`);
    }

    return this.getRecipe(idx);
  }

  getRecipe(idx) {
    if (!this.map.has(idx)) {
      throw new Error(`Index '${idx}' does not exist.`);
    }

    return this.map.get(idx);
  }

  addRecipe(recipe) {
    this.createRecipe(++this.index, recipe);
  }

  addRecipes(newRecipes) {
    if (newRecipes > 9) {
      this.addRecipe(1);
      this.addRecipe(newRecipes - 10);
    } else {
      this.addRecipe(newRecipes);
    }
  }

  get length() {
    return this.map.size;
  }

  get part02Answer() {
    return this.matchStart;
  }

  patternFound(pattern) {
    if ((this.map.size - this.matchStart) >= pattern.length) {
      let foundPattern = true;
      for (let i = this.matchStart; i < (this.matchStart + input.length); i++) {
        if (!this.map.has(i)) {
          foundPattern = false;
          break;
        } else if (this.map.get(i).toString() !== input[i - this.matchStart]) {
          this.matchStart++;
          i = this.matchStart;
        }
      }
      return foundPattern;
    }

    return false;
  }
}

const recipes = new Recipes();
recipes.addRecipe(3);
recipes.addRecipe(7);

let elf01Idx = 0;
let elf02Idx = 1;

const start = new Date();

while (!recipes.patternFound(input)) {
  let recipe01 = recipes.getRecipe(elf01Idx);
  let recipe02 = recipes.getRecipe(elf02Idx);

  const newRecipe = recipe01 + recipe02;
  recipes.addRecipes(newRecipe);

  elf01Idx = (elf01Idx + (1 + recipe01)) % recipes.length;
  elf02Idx = (elf02Idx + (1 + recipe02)) % recipes.length;

  if (recipes.length % 100000 === 0) {
    console.log(`Accumulated ${recipes.length} recipes... (${(new Date().getTime() - start.getTime()) / (1000)} seconds) [${require('v8').getHeapStatistics().total_available_size}]`);
  }
}

console.log(`part 02 answer: ${recipes.part02Answer}`);