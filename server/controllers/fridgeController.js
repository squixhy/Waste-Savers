const FoodItem = require('../models/ingredient');

async function getFoodDiary(req, res, next) {
    try {
        const ingredients = await ingredient.find({}).lean();

        if (ingredients.length === 0) {
            return res.json({ diaryEmpty: true, ingredients: [] });
        }

        res.json({ diaryEmpty: false, ingredients });
    } catch (err) {
        console.error('Failed to fetch food diary:', err);
        res.status(err.status || 500).json({ error: err.message });
    }
}

module.exports = { getFoodDiary };