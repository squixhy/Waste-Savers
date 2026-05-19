const SPOONACULAR = 'https://api.spoonacular.com';

function requireKey() {
  const key = process.env.SPOONACULAR_KEY;
  if (!key) {
    const err = new Error('Spoonacular API key is not set/not found in the .env file');
    err.status = 500;
    throw err;
  }
  return key;
}

async function findRecipesByIngredients(ingredientNames, { number = 25 } = {}) {
  const apiKey = requireKey();
  if (!ingredientNames || ingredientNames.length === 0) return [];

  const params = new URLSearchParams({
    ingredients: ingredientNames.join(','),
    number: String(number),
    ranking: '1',
    ignorePantry: 'true',
    apiKey,
  });

  const res = await fetch(`${SPOONACULAR}/recipes/findByIngredients?${params.toString()}`);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Spoonacular request failed (${res.status}): ${body || res.statusText}`);
    err.status = 502;
    throw err;
  }

  return res.json();
}

async function getRecipeInformation(id) {
  const apiKey = requireKey();
  const params = new URLSearchParams({ includeNutrition: 'false', apiKey });

  const res = await fetch(
    `${SPOONACULAR}/recipes/${encodeURIComponent(id)}/information?${params.toString()}`
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Spoonacular request failed (${res.status}): ${body || res.statusText}`);
    err.status = 502;
    throw err;
  }

  return res.json();
}

module.exports = { findRecipesByIngredients, getRecipeInformation };