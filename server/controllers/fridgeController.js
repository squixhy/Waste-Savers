const FoodItem = require('../models/ingredient');

async function getFoodDiary(req, res) {
    try {
        const ingredients = await FoodItem.find({}).lean();

        res.json({
            diaryEmpty: ingredients.length === 0,
            ingredients
        });
    } catch (err) {
        console.error('Failed to fetch food diary:', err);
        res.status(500).json({ error: err.message });
    }
}

async function addFoodItem(req, res) {
    try {
        const item = new FoodItem({
            name: req.body.name,
            expiryDate: req.body.expiryDate,
            calories: req.body.calories,
            quantity: req.body.quantity,
            dateAdded: new Date()
        });

        const saved = await item.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Failed to add food item:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getFoodDiary, addFoodItem };