using System;
using System.Collections.Generic;

namespace Part02.CSharp
{
    internal class Recipes
    {
        private int _index = -1;
        private int _matchStart;
        private readonly Dictionary<int, int> _map = new Dictionary<int, int>();

        public int Length => _map.Count;
        public int Part02Answer => _matchStart;

        public void AddRecipes(int newRecipes)
        {
            if (newRecipes > 9)
            {
                AddRecipe(1);
                AddRecipe(newRecipes - 10);
            }
            else
            {
                AddRecipe(newRecipes);
            }
        }

        public int GetRecipe(int index)
        {
            return _map[index];
        }

        public bool PatternFound(string pattern)
        {
            if (Length - _matchStart < pattern.Length) return false;

            var foundPattern = true;
            var patternChars = pattern.ToCharArray();
            for (var i = _matchStart; i < (_matchStart + pattern.Length); i++)
            {
                if (!_map.ContainsKey(i))
                {
                    foundPattern = false;
                    break;
                }

                if (_map[i].ToString() == patternChars[i - _matchStart].ToString()) continue;

                _matchStart++;
                i = _matchStart;
            }

            return foundPattern;
        }

        private void AddRecipe(int recipe)
        {
            var idx = ++_index;
            _map.Add(idx, recipe);
        }
    }

    internal static class Program
    {
        private static Recipes _recipes = new Recipes();
        private static int _elf01Idx = 0;
        private static int _elf02Idx = 1;

        private const string Input = "077201";

        public static void Main(string[] args)
        {
            _recipes.AddRecipes(3);
            _recipes.AddRecipes(7);

            var start = DateTime.UtcNow;
            while (!_recipes.PatternFound(Input))
            {
                var recipe01 = _recipes.GetRecipe(_elf01Idx);
                var recipe02 = _recipes.GetRecipe(_elf02Idx);

                var newRecipes = recipe01 + recipe02;
                _recipes.AddRecipes(newRecipes);

                _elf01Idx = (_elf01Idx + 1 + recipe01) % _recipes.Length;
                _elf02Idx = (_elf02Idx + 1 + recipe02) % _recipes.Length;

                if (_recipes.Length % 100000 == 0)
                {
                    Console.WriteLine($"Accumulated {_recipes.Length} recipes... ({DateTime.UtcNow.Subtract(start)})");
                }
            }

            Console.WriteLine($"part 02 answer: {_recipes.Part02Answer}");
        }
    }
}