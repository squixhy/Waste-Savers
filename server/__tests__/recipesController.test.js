

const { getRecipes, getRecipeById } = require('../controllers/recipesController');
const Ingredient = require('../models/Ingredient');
const spoonacular = require('../services/spoonacular');

jest.mock('../models/Ingredient');
jest.mock('../services/spoonacular');

function mockRes() {
  return {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };
}

function stubFridge(names) {
  Ingredient.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue(names.map((name) => ({ name }))),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('getRecipes', () => {
  test('AT-01: returns fridgeEmpty and empty arrays when the fridge has no ingredients', async () => {
    stubFridge([]);
    const res = mockRes();

    await getRecipes({}, res);

    expect(res.json).toHaveBeenCalledWith({
      fridgeEmpty: true,
      canMake: [],
      closeTo: [],
    });
    expect(spoonacular.findRecipesByIngredients).not.toHaveBeenCalled();
  });

  test('AT-02: splits results into canMake (0 missed) and closeTo (1-3 missed)', async () => {
    stubFridge(['egg', 'flour']);
    spoonacular.findRecipesByIngredients.mockResolvedValue([
      { id: 1, missedIngredientCount: 0 },
      { id: 2, missedIngredientCount: 2 },
      { id: 3, missedIngredientCount: 0 },
    ]);
    const res = mockRes();

    await getRecipes({}, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.fridgeEmpty).toBe(false);
    expect(payload.canMake.map((r) => r.id)).toEqual([1, 3]);
    expect(payload.closeTo.map((r) => r.id)).toEqual([2]);
  });

  test('AT-03: excludes recipes needing more than CLOSE_THRESHOLD (3) ingredients', async () => {
    stubFridge(['egg']);
    spoonacular.findRecipesByIngredients.mockResolvedValue([
      { id: 1, missedIngredientCount: 3 }, 
      { id: 2, missedIngredientCount: 4 }, 
    ]);
    const res = mockRes();

    await getRecipes({}, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.closeTo.map((r) => r.id)).toEqual([1]);
  });

  test('AT-04: caps each section at PER_SECTION (12) recipes', async () => {
    stubFridge(['egg']);
    const make = Array.from({ length: 20 }, (_, i) => ({ id: i, missedIngredientCount: 0 }));
    const close = Array.from({ length: 20 }, (_, i) => ({ id: 100 + i, missedIngredientCount: 2 }));
    spoonacular.findRecipesByIngredients.mockResolvedValue([...make, ...close]);
    const res = mockRes();

    await getRecipes({}, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.canMake).toHaveLength(12);
    expect(payload.closeTo).toHaveLength(12);
  });

  test('responds with the error status when the data layer throws', async () => {
    Ingredient.find.mockReturnValue({
      lean: jest
        .fn()
        .mockRejectedValue(Object.assign(new Error('db down'), { status: 500 })),
    });
    const res = mockRes();

    await getRecipes({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
  });
});

describe('getRecipeById', () => {
  test('returns the recipe details for a given id', async () => {
    spoonacular.getRecipeInformation.mockResolvedValue({ id: 42, title: 'Omelette' });
    const res = mockRes();

    await getRecipeById({ params: { id: '42' } }, res);

    expect(spoonacular.getRecipeInformation).toHaveBeenCalledWith('42');
    expect(res.json).toHaveBeenCalledWith({ id: 42, title: 'Omelette' });
  });
});
