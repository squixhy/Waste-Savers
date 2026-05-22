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

let fatSecretAccessToken = null;
let fatSecretTokenExpiry = 0;

async function getFatSecretAccessToken() {
    const clientId = process.env.FATSECRET_CLIENT_ID;
    const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("FATSECRET_CLIENT_ID or FATSECRET_CLIENT_SECRET is missing. Add them to your backend .env file and restart the server.");
    }

    if (fatSecretAccessToken && Date.now() < fatSecretTokenExpiry) {
        return fatSecretAccessToken;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenResponse = await fetch("https://oauth.fatsecret.com/connect/token", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            scope: "basic"
        })
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`FatSecret token request failed: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    fatSecretAccessToken = tokenData.access_token;
    fatSecretTokenExpiry = Date.now() + ((Number(tokenData.expires_in) || 86400) - 60) * 1000;

    return fatSecretAccessToken;
}

async function callFatSecretApi(params) {
    const accessToken = await getFatSecretAccessToken();

    const response = await fetch("https://platform.fatsecret.com/rest/server.api", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            ...params,
            format: "json"
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FatSecret API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`FatSecret API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return data;
}

function normaliseToArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function getFatSecretFoods(searchData) {
    return normaliseToArray(searchData.foods?.food || searchData.foods_search?.results?.food);
}

function getFatSecretServings(foodData) {
    return normaliseToArray(foodData.food?.servings?.serving || foodData.food?.serving);
}

function getServingMetricAmount(serving) {
    return Number(serving.metric_serving_amount || serving.metricServingAmount || 0);
}

function getServingMetricUnit(serving) {
    return String(serving.metric_serving_unit || serving.metricServingUnit || "").toLowerCase().trim();
}

function normaliseServingUnit(unit) {
    const normalisedUnit = String(unit || "").toLowerCase().trim();

    if (["g", "gram", "grams"].includes(normalisedUnit)) {
        return "g";
    }

    if (["ml", "millilitre", "milliliter", "millilitres", "milliliters"].includes(normalisedUnit)) {
        return "ml";
    }

    if (["oz", "ounce", "ounces"].includes(normalisedUnit)) {
        return "oz";
    }

    return normalisedUnit;
}

function selectBestServing(servings, requestedUnit) {
    const normalisedRequestedUnit = requestedUnit === "ml" ? "ml" : "g";

    const usableServings = servings.filter((serving) => {
        const amount = getServingMetricAmount(serving);
        const calories = Number(serving.calories);
        return amount > 0 && !Number.isNaN(calories);
    });

    if (usableServings.length === 0) {
        return null;
    }

    const exactUnitMatch = usableServings.filter((serving) =>
        normaliseServingUnit(getServingMetricUnit(serving)) === normalisedRequestedUnit
    );

    if (exactUnitMatch.length > 0) {
        return exactUnitMatch.find((serving) => Number(serving.is_default) === 1) || exactUnitMatch[0];
    }

    if (normalisedRequestedUnit === "ml") {
        const gramServing = usableServings.find((serving) =>
            normaliseServingUnit(getServingMetricUnit(serving)) === "g"
        );

        if (gramServing) {
            return {
                ...gramServing,
                metric_serving_unit: "ml",
                metric_serving_amount: getServingMetricAmount(gramServing)
            };
        }
    }

    return usableServings.find((serving) => Number(serving.is_default) === 1) || usableServings[0];
}

async function getFatSecretFoodDetails(name, requestedUnit) {
    const searchData = await callFatSecretApi({
        method: "foods.search",
        search_expression: name,
        max_results: "5",
        page_number: "0"
    });

    const foods = getFatSecretFoods(searchData);

    if (foods.length === 0) {
        return null;
    }

    for (const food of foods) {
        const foodId = food.food_id || food.foodId;

        if (!foodId) {
            continue;
        }

        const foodData = await callFatSecretApi({
            method: "food.get.v5",
            food_id: foodId,
            serving_amount_unit: requestedUnit
        });

        const servings = getFatSecretServings(foodData);
        const selectedServing = selectBestServing(servings, requestedUnit);

        if (selectedServing) {
            return {
                food: foodData.food,
                serving: selectedServing
            };
        }
    }

    return null;
}

async function getCaloriesFromUsda(req, res) {
    try {
        const { name, amount, unit } = req.query;

        if (!name || !amount || !unit) {
            return res.status(400).json({
                error: "Please provide name, amount, and unit"
            });
        }

        const requestedUnit = String(unit).toLowerCase().trim();

        if (requestedUnit !== "g" && requestedUnit !== "ml") {
            return res.status(400).json({
                error: "Unit must be g or ml"
            });
        }

        const fatSecretFood = await getFatSecretFoodDetails(name, requestedUnit);

        if (!fatSecretFood) {
            return res.status(404).json({
                error: "Food or matching serving size not found in FatSecret"
            });
        }

        const { food, serving } = fatSecretFood;
        const servingAmount = getServingMetricAmount(serving);
        const servingUnit = getServingMetricUnit(serving);
        const servingCalories = Number(serving.calories);

        if (!servingAmount || Number.isNaN(servingCalories)) {
            return res.status(404).json({
                error: "Suitable FatSecret serving data not found for this unit"
            });
        }

        const caloriesPerUnit = servingCalories / servingAmount;
        const caloriesPer100 = caloriesPerUnit * 100;
        const totalCalories = caloriesPerUnit * Number(amount);

        res.json({
            foodName: food.food_name || food.foodName || name,
            fatSecretFoodId: food.food_id || food.foodId,
            amount: Number(amount),
            unit: requestedUnit,
            caloriesPer100g: Number(caloriesPer100.toFixed(2)),
            calories: Math.round(totalCalories),
            recommendedPortionSize: Number(servingAmount.toFixed(2)),
            recommendedPortionUnit: servingUnit,
            portionSource: serving.measurement_description || "FatSecret serving",
            caloriesPerRecommendedPortion: Math.round(servingCalories)
        });
    } catch (err) {
        console.error("Failed to fetch calories from FatSecret:", err);
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