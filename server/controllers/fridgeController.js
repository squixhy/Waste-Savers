const FoodItem = require('../models/ingredient');

async function getFoodDiary(req, res) {
    try {
        const ingredients = await FoodItem.find({}).lean();

        const grouped = {};
        ingredients.forEach((item) => {
            const key = item.name.toLowerCase();
            if (!grouped[key]) {
                grouped[key] = {
                    _id: key,
                    name: item.name,
                    expiryDate: item.expiryDate,
                    calories: item.calories,
                    portions: 0,
                    portionSize: item.portionSize,
                    unit: item.unit,
                    totalAmount: 0,
                    entries: []
                };
            }
            grouped[key].portions += Number(item.portions);
            grouped[key].totalAmount += Number(item.portions || 0) * Number(item.portionSize || 0);
            grouped[key].entries.push({
                _id: item._id,
                portions: item.portions,
                portionSize: item.portionSize,
                unit: item.unit,
                totalAmount: Number(item.portions || 0) * Number(item.portionSize || 0),
                calories: item.calories,
                expiryDate: item.expiryDate,
                dateAdded: item.dateAdded
            });

            // keep the closest expiry date
            if (!grouped[key].expiryDate || new Date(item.expiryDate) < new Date(grouped[key].expiryDate)) {
                grouped[key].expiryDate = item.expiryDate;
            }
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
        const { name, expiryDate, calories, portions, portionSize, unit } = req.body;

        const item = new FoodItem({
            name,
            expiryDate,
            calories,
            portions,
            portionSize,
            unit,
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
                portions: req.body.portions,
                portionSize: req.body.portionSize,
                unit: req.body.unit,
            },
            { returnDocument: "after" }
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

function findCaloriesNutrient(food) {
    return food.foodNutrients?.find((nutrient) => {
        const name = nutrient.name || nutrient.nutrientName || nutrient.nutrient?.name;
        const unitName = nutrient.unitName || nutrient.nutrient?.unitName;
        return name === "Energy" && unitName === "KCAL";
    });
}

function getNutrientAmount(nutrient) {
    return nutrient?.amount || nutrient?.value || nutrient?.nutrient?.amount;
}

function getRecommendedPortion(food, requestedUnit) {
    const firstGramPortion = food.foodPortions?.find((portion) => portion.gramWeight);

    if (requestedUnit === "ml") {
        if (food.servingSize && food.servingSizeUnit?.toLowerCase() === "ml") {
            return {
                recommendedPortionSize: Number(food.servingSize),
                recommendedPortionUnit: "ml",
                portionSource: "USDA servingSize"
            };
        }

        return {
            recommendedPortionSize: 250,
            recommendedPortionUnit: "ml",
            portionSource: "fallback"
        };
    }

    if (firstGramPortion) {
        return {
            recommendedPortionSize: Number(firstGramPortion.gramWeight),
            recommendedPortionUnit: "g",
            portionSource: firstGramPortion.portionDescription || "USDA foodPortions"
        };
    }

    if (food.servingSize && food.servingSizeUnit?.toLowerCase() === "g") {
        return {
            recommendedPortionSize: Number(food.servingSize),
            recommendedPortionUnit: "g",
            portionSource: "USDA servingSize"
        };
    }

    return {
        recommendedPortionSize: 100,
        recommendedPortionUnit: "g",
        portionSource: "fallback"
    };
}

async function getCaloriesFromUsda(req, res) {
    try {
        const { name, amount, unit } = req.query;

        if (!name || !amount || !unit) {
            return res.status(400).json({
                error: "Please provide name, amount, and unit"
            });
        }

        const apiKey = process.env.USDA_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "USDA_API_KEY is missing. Add it to your backend .env file and restart the server."
            });
        }

        const searchUrl =
            `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(name)}&dataType=Foundation,SR Legacy&pageSize=1`;

        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            return res.status(searchResponse.status).json({
                error: "USDA API search request failed",
                status: searchResponse.status,
                details: errorText
            });
        }

        const searchData = await searchResponse.json();

        if (!searchData.foods || searchData.foods.length === 0) {
            return res.status(404).json({ error: "Food not found" });
        }

        const searchFood = searchData.foods[0];

        const detailsUrl =
            `https://api.nal.usda.gov/fdc/v1/food/${searchFood.fdcId}?api_key=${apiKey}&format=full`;

        const detailsResponse = await fetch(detailsUrl);

        if (!detailsResponse.ok) {
            const errorText = await detailsResponse.text();
            return res.status(detailsResponse.status).json({
                error: "USDA API food details request failed",
                status: detailsResponse.status,
                details: errorText
            });
        }

        const detailedFood = await detailsResponse.json();
        const caloriesNutrient = findCaloriesNutrient(detailedFood) || findCaloriesNutrient(searchFood);

        if (!caloriesNutrient) {
            return res.status(404).json({ error: "Calories not found for this food" });
        }

        const caloriesPer100g = getNutrientAmount(caloriesNutrient);

        if (!caloriesPer100g) {
            return res.status(404).json({ error: "Calories amount not found for this food" });
        }

        const portion = getRecommendedPortion(detailedFood, unit);
        const calories = (Number(caloriesPer100g) / 100) * Number(amount);
        const caloriesPerRecommendedPortion =
            (Number(caloriesPer100g) / 100) * Number(portion.recommendedPortionSize);

        res.json({
            foodName: detailedFood.description || searchFood.description,
            fdcId: detailedFood.fdcId || searchFood.fdcId,
            amount: Number(amount),
            unit,
            caloriesPer100g,
            calories: Math.round(calories),
            recommendedPortionSize: portion.recommendedPortionSize,
            recommendedPortionUnit: portion.recommendedPortionUnit,
            portionSource: portion.portionSource,
            caloriesPerRecommendedPortion: Math.round(caloriesPerRecommendedPortion)
        });
    } catch (err) {
        console.error("Failed to fetch calories from USDA:", err);
        res.status(500).json({ error: err.message });
    }
}



module.exports = {
    getFoodDiary,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getCaloriesFromUsda
};