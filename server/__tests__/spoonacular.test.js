

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  jest.resetModules();             
  process.env = { ...ORIGINAL_ENV };
  global.fetch = jest.fn();       
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

describe('findRecipesByIngredients', () => {
  test('AT-05: throws a 500 error when SPOONACULAR_KEY is not set', async () => {
    delete process.env.SPOONACULAR_KEY;
    const { findRecipesByIngredients } = require('../services/spoonacular');

    await expect(findRecipesByIngredients(['egg'])).rejects.toMatchObject({
      status: 500,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('AT-06: returns [] for an empty ingredient list without calling the API', async () => {
    process.env.SPOONACULAR_KEY = 'test-key';
    const { findRecipesByIngredients } = require('../services/spoonacular');

    const result = await findRecipesByIngredients([]);

    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('AT-07: throws a 502 error when the upstream returns a non-200 status', async () => {
    process.env.SPOONACULAR_KEY = 'test-key';
    global.fetch.mockResolvedValue({
      ok: false,
      status: 402,
      statusText: 'Payment Required',
      text: jest.fn().mockResolvedValue('Daily quota exceeded'),
    });
    const { findRecipesByIngredients } = require('../services/spoonacular');

    await expect(findRecipesByIngredients(['egg'])).rejects.toMatchObject({
      status: 502,
    });
  });

  test('returns the parsed recipe array on a successful response', async () => {
    process.env.SPOONACULAR_KEY = 'test-key';
    const fakeRecipes = [{ id: 1, missedIngredientCount: 0 }];
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(fakeRecipes),
    });
    const { findRecipesByIngredients } = require('../services/spoonacular');

    const result = await findRecipesByIngredients(['egg', 'flour']);

    expect(result).toEqual(fakeRecipes);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('getRecipeInformation', () => {
  test('throws a 502 error when the upstream returns a non-200 status', async () => {
    process.env.SPOONACULAR_KEY = 'test-key';
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: jest.fn().mockResolvedValue('Recipe not found'),
    });
    const { getRecipeInformation } = require('../services/spoonacular');

    await expect(getRecipeInformation('999999')).rejects.toMatchObject({
      status: 502,
    });
  });
});
