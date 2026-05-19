const Ingredient = require('../models/Ingredient');
const { findRecipiesByIngredients } = require('../services/spoonacular');

async function getRecipes(req, res, next) {
    try {
        const ingredients = await Ingredient.find({}, 'name').lean();
        const names = ingredients.map((i) => i.name).filter(Boolean);

        if (names.length === 0) {
            return res.json({ fridgeEmpty: true, recipes: [] });
        }

        const recipes = await findRecipiesByIngredients(names);
        res.json({ fridgeEmpty: false, recipes });
    } catch (err) {
        console.error('Failed to fetch recipies:', err);
        res.status(err.status || 500).json({ error: err.message });
    }
}

module.exports = { getRecipes };

// Controler fetches ingredients from the database. 