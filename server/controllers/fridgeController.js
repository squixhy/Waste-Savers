const FoodItem = require('../models/ingredient');

async function getFoodDiary(req, res) {
    try {
        const ingredients = await FoodItem.find({}).lean();

        const grouped = {};
        ingredients.forEach((item) => {
            const key = `${item.name}__${item.expiryDate}__${item.calories}`;
            if (!grouped[key]) {
                grouped[key] = {
                    _id: key,
                    name: item.name,
                    expiryDate: item.expiryDate,
                    calories: item.calories,
                    quantity: 0,
                    entries: []
                };
            }
            grouped[key].quantity += Number(item.quantity);
            grouped[key].entries.push({
                _id: item._id,
                quantity: item.quantity,
                dateAdded: item.dateAdded
            });
        });

        const result = Object.values(grouped);

        res.json({
            diaryEmpty: result.length === 0,
            ingredients: result
        });
    } catch (err) {
        console.error('Failed to fetch food diary:', err);
        res.status(500).json({ error: err.message });
    }
}

async function addFoodItem(req, res) {
    try {
        const { name, expiryDate, calories, quantity } = req.body;

        const item = new FoodItem({
            name,
            expiryDate,
            calories,
            quantity,
            dateAdded: new Date()
        });

        const saved = await item.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Failed to add food item:', err);
        res.status(500).json({ error: err.message });
    }
}

async function updateFoodItem(req, res) {
    try {
        const updated = await FoodItem.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                expiryDate: req.body.expiryDate,
                calories: req.body.calories,
                quantity: req.body.quantity,
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: 'Item not found' });

        res.json(updated);
    } catch (err) {
        console.error('Failed to update food item:', err);
        res.status(500).json({ error: err.message });
    }
}

async function deleteFoodItem(req, res) {
    try {
        const deleted = await FoodItem.findByIdAndDelete(req.params.id);

        if (!deleted) return res.status(404).json({ error: 'Item not found' });

        res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete food item:', err);
        res.status(500).json({ error: err.message });
    }
}



module.exports = { getFoodDiary, addFoodItem, updateFoodItem, deleteFoodItem };