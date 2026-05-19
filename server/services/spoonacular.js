const SPOONACULAR = 'https://api.spoonacular.com';

async function findRecipesByIngredients(ingredientNames, { number = 12 } = {}) {
    const SPOONACULAR_KEY = process.env.SPOONACULAR_KEY; 
    if (!SPOONACULAR_KEY) { 
        const err = new Error('Spoonacular API key is not set/not found in the .env file');
        err.status = 500;
        throw err;
    }

    if (!ingredientNames || ingredientNames.length === 0) return [];

    const params = new URLSearchParams({
        ingredients: ingredientNames.join(','),
        number: String(number),
        ranking: '1',
        ignorePantry: 'true',
        apiKey: SPOONACULAR_KEY,
    });

    const res = await fetch(
        `${SPOONACULAR}/recipes/findByIngredients?${params.toString()}`,
    );

    if (!res.ok) { 
        const body = await res.text().catch(() => '');
        const err = new Error(`Spoonacular request failed (${res.status}): ${body || res.statusText}`);
        err.status = 502; 
        throw err;
    }

    return res.json();

}

module.exports = { findRecipesByIngredients };