const express = require('express');
const router = express.Router();
const { getRecipes, getRecipeById } = require('../controllers/recipesController');

router.get('/', getRecipes);
router.get('/:id', getRecipeById);

module.exports = router;