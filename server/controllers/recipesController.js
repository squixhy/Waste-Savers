const Ingredient = require('../models/Ingredient');
const { findRecipesByIngredients, getRecipeInformation } = require('../services/spoonacular');

const CLOSE_THRESHOLD = 3;
const PER_SECTION = 12;

async function getRecipes(req, res) {
  try {
    const ingredients = await Ingredient.find({}, 'name').lean();
    const names = ingredients.map((i) => i.name).filter(Boolean);

    if (names.length === 0) {
      return res.json({ fridgeEmpty: true, canMake: [], closeTo: [] });
    }

    const recipes = await findRecipesByIngredients(names, { number: 25 });

    const canMake = recipes
      .filter((r) => r.missedIngredientCount === 0)
      .slice(0, PER_SECTION);

    const closeTo = recipes
      .filter((r) => r.missedIngredientCount > 0 && r.missedIngredientCount <= CLOSE_THRESHOLD)
      .slice(0, PER_SECTION);

    res.json({ fridgeEmpty: false, canMake, closeTo });
  } catch (err) {
    console.error('Failed to fetch recipes:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function getRecipeById(req, res) {
  try {
    const recipe = await getRecipeInformation(req.params.id);
    res.json(recipe);
  } catch (err) {
    console.error('Failed to fetch recipe details:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getRecipes, getRecipeById };